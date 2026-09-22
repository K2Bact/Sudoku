package com.powerneja.suidoku;

import android.os.Bundle;
import android.content.SharedPreferences;
import android.util.Log;
import com.getcapacitor.BridgeActivity;
import com.google.android.gms.games.PlayGamesSdk;
import com.google.android.gms.games.PlayGames;
import com.google.android.gms.games.GamesSignInClient;
import com.google.android.gms.games.PlayersClient;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "SuidokuPlayGames";
    private static final String PGS_PREFS = "suidoku_pgs";
    private static final String PGS_ASKED_KEY = "auto_signin_asked";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Local plugins must be registered before the bridge starts.
        registerPlugin(NativeInfoPlugin.class);
        super.onCreate(savedInstanceState);

        // System font size: honoured, up to 130% (BACKLOG U-1, 2026-09-19).
        // The WebView otherwise follows the phone's setting without limit, and at
        // the largest sizes the game screen's header and keypad grow until the
        // board has no room. Past 130% the gain in legibility is small and the
        // layout cost is not; the board's own digits cancel this factor anyway
        // (src/utils/textZoom.js), so the cap only bounds the chrome around it.
        // A font-size change recreates this activity (fontScale is not in
        // configChanges), so reading it here is enough.
        try {
            float fontScale = getResources().getConfiguration().fontScale;
            int zoom = Math.round(Math.min(Math.max(fontScale, 0.85f), 1.3f) * 100);
            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().getSettings().setTextZoom(zoom);
            }
        } catch (Exception e) {
            Log.w(TAG, "Could not cap the WebView text zoom", e);
        }

        // Restrict content view strictly within system window insets (Status Bar bottom to Navigation Bar top)
        android.view.View contentView = findViewById(android.R.id.content);
        if (contentView != null) {
            androidx.core.view.ViewCompat.setOnApplyWindowInsetsListener(contentView, (v, windowInsets) -> {
                androidx.core.graphics.Insets insets = windowInsets.getInsets(
                    androidx.core.view.WindowInsetsCompat.Type.systemBars() | androidx.core.view.WindowInsetsCompat.Type.displayCutout()
                );
                v.setPadding(insets.left, insets.top, insets.right, insets.bottom);
                return androidx.core.view.WindowInsetsCompat.CONSUMED;
            });
        }

        try {
            // 1. Initialize Play Games Services SDK v2
            PlayGamesSdk.initialize(this);

            // 2. Sign-in.
            //
            // isAuthenticated() is the quiet check; signIn() is not quiet — with no
            // prior link it opens Google's account picker. The comment here used to
            // say "Automatic Silent Sign-In", which is what the call was believed to
            // do rather than what it did.
            //
            // On a real device this asked on every single launch. Cancelling changed
            // nothing: the next launch asked again, and the one after that. A player
            // who does not want Play Games could never be rid of it.
            //
            // So the prompt is offered once per install. The flag is written BEFORE
            // the attempt, not after a failure — cancelling does not reliably deliver
            // a callback, so "record the failure" would never have run. Success
            // clears it, and from then on isAuthenticated() restores the session with
            // no UI at all.
            //
            // Settings still has an explicit [Play Games] button for anyone who wants
            // it later. Nothing here removes the feature; it stops the nagging.
            GamesSignInClient gamesSignInClient = PlayGames.getGamesSignInClient(this);
            SharedPreferences pgsPrefs = getSharedPreferences(PGS_PREFS, MODE_PRIVATE);
            gamesSignInClient.isAuthenticated().addOnCompleteListener(isAuthenticatedTask -> {
                try {
                    boolean isAuthenticated = (isAuthenticatedTask.isSuccessful() && isAuthenticatedTask.getResult() != null && isAuthenticatedTask.getResult().isAuthenticated());
                    boolean isDebug = (getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0;
                    boolean alreadyAsked = pgsPrefs.getBoolean(PGS_ASKED_KEY, false);
                    if (isAuthenticated) {
                        Log.i(TAG, "Play Games already authenticated!");
                        pgsPrefs.edit().putBoolean(PGS_ASKED_KEY, false).apply();
                        requestPlayerInfo();
                    } else if (!isDebug && !alreadyAsked) {
                        Log.i(TAG, "Play Games sign-in prompt (once per install)...");
                        pgsPrefs.edit().putBoolean(PGS_ASKED_KEY, true).apply();
                        gamesSignInClient.signIn().addOnCompleteListener(signInTask -> {
                            try {
                                if (signInTask.isSuccessful() && signInTask.getResult() != null && signInTask.getResult().isAuthenticated()) {
                                    Log.i(TAG, "Play Games sign-in successful!");
                                    pgsPrefs.edit().putBoolean(PGS_ASKED_KEY, false).apply();
                                    requestPlayerInfo();
                                } else {
                                    Log.w(TAG, "Play Games sign-in failed or cancelled — not asking again automatically");
                                }
                            } catch (Exception ignored) {}
                        });
                    } else if (!isDebug) {
                        Log.i(TAG, "Play Games not connected; already asked once, staying quiet");
                    }
                } catch (Exception ignored) {}
            });
        } catch (Exception e) {
            Log.e(TAG, "Error initializing Play Games SDK", e);
        }
    }

    private void requestPlayerInfo() {
        try {
            PlayersClient playersClient = PlayGames.getPlayersClient(this);
            playersClient.getCurrentPlayer().addOnCompleteListener(playerTask -> {
                if (playerTask.isSuccessful() && playerTask.getResult() != null) {
                    String displayName = playerTask.getResult().getDisplayName();
                    String playerId = playerTask.getResult().getPlayerId();
                    Log.i(TAG, "Signed in Player: " + displayName + " (" + playerId + ")");

                    // Dispatch to webview Javascript event
                    runOnUiThread(() -> {
                        if (getBridge() != null && getBridge().getWebView() != null) {
                            String js = String.format(
                                "window.dispatchEvent(new CustomEvent('playGamesSignedIn', { detail: { displayName: '%s', playerId: '%s' } }));",
                                displayName.replace("'", "\\'"),
                                playerId.replace("'", "\\'")
                            );
                            getBridge().getWebView().evaluateJavascript(js, null);
                        }
                    });
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "Error requesting player info", e);
        }
    }
}
