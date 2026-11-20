package com.powerneja.suidoku;

import android.os.Bundle;
import android.content.SharedPreferences;
import android.util.Log;
import com.getcapacitor.BridgeActivity;
import com.google.android.gms.games.PlayGamesSdk;
import com.google.android.gms.games.PlayGames;
import com.google.android.gms.games.GamesSignInClient;
import com.google.android.gms.games.PlayersClient;
import org.json.JSONObject;

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
        // Since D9 (2026-11-06) the player's own text size multiplies it, under the
        // same cap — stored by NativeInfoPlugin.setTextScale, so it is in place
        // before the page loads.
        try {
            int zoom = textZoomFor(this, savedTextStep(this));
            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().getSettings().setTextZoom(zoom);
            }
        } catch (Exception e) {
            Log.w(TAG, "Could not cap the WebView text zoom", e);
        }

        // Rotation: free on a large screen, still portrait on a phone.
        //
        // android:screenOrientation="portrait" used to be in the manifest, which
        // locks every device including tablets and foldables. Play's large-screen
        // guidance treats that as an app that does not support the device, and the
        // console lists it under recommended actions.
        //
        // A phone stays portrait because the game screen is a column — board over
        // keypad — and in landscape on a 5-inch-tall window the board would be the
        // size of a stamp. A tablet has the room, and the layout answers with two
        // columns (styles/gameHeader.css, the landscape rule).
        //
        // 600dp of smallest width is Android's own line between a phone and a
        // tablet, the same one the sw600dp resource qualifier uses.
        applyOrientationPolicy(getResources().getConfiguration());

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

    /**
     * A foldable crosses the phone/tablet line while the app is running.
     *
     * This activity declares smallestScreenSize, screenLayout and screenSize in
     * configChanges, so unfolding does NOT recreate it — onCreate runs once, with
     * whatever size the device had at launch. Deciding the policy only there means
     * an app opened folded stays locked upright after it becomes a tablet, and,
     * worse, an app opened unfolded keeps free rotation after it is folded back:
     * the game screen would lay itself out sideways in a window about 5 inches
     * tall, which is the stamp-sized board the phone rule exists to prevent.
     *
     * So the same decision is made again whenever the configuration changes.
     */
    @Override
    public void onConfigurationChanged(android.content.res.Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        // newConfig, not getResources(): this callback is handed the new values,
        // and reading them back out of the resources means trusting that they
        // have already been swapped. The one that cannot be stale is the one in
        // the argument.
        applyOrientationPolicy(newConfig);
    }

    // The player's text size step (D9): 0.9 · 1 · 1.15 · 1.3, kept by NativeInfoPlugin.
    static final String TEXT_PREFS = "suidoku_display";
    static final String TEXT_STEP_KEY = "text_step";

    static float savedTextStep(android.content.Context ctx) {
        try {
            return ctx.getSharedPreferences(TEXT_PREFS, android.content.Context.MODE_PRIVATE).getFloat(TEXT_STEP_KEY, 1f);
        } catch (Exception e) {
            return 1f;
        }
    }

    /**
     * The WebView text zoom, in percent: the phone's font scale times the player's
     * step, inside 0.85..1.3 — the cap U-1 set, which the layouts are gated to.
     */
    static int textZoomFor(android.content.Context ctx, float step) {
        // NaN passes both clamps below (Math.max/min return NaN) and rounds to a 0% zoom.
        // The bridge cannot send one today (JSON has no NaN; it arrives as null → 1), so
        // this only keeps a future caller from blanking the text (review 2026-11-20).
        if (Float.isNaN(step)) step = 1f;
        float fontScale = ctx.getResources().getConfiguration().fontScale;
        float s = Math.min(Math.max(step, 0.8f), 1.4f);
        return Math.round(Math.min(Math.max(fontScale * s, 0.85f), 1.3f) * 100);
    }

    /** Free rotation on a large screen, upright on a phone. See onCreate. */
    private void applyOrientationPolicy(android.content.res.Configuration config) {
        try {
            boolean largeScreen = config != null && config.smallestScreenWidthDp >= 600;
            setRequestedOrientation(largeScreen
                ? android.content.pm.ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
                : android.content.pm.ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        } catch (Exception e) {
            Log.w(TAG, "Could not set the orientation policy", e);
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

                    // Dispatch to webview Javascript event. JSONObject.quote writes each value as a
                    // whole JSON string literal (quotes, backslashes, line breaks, "</" all escaped,
                    // null → ""). Escaping only ' let a name with a backslash end the string early:
                    // a syntax error, and the event never fired (review 2026-11-20).
                    runOnUiThread(() -> {
                        if (getBridge() != null && getBridge().getWebView() != null) {
                            String js = String.format(
                                "window.dispatchEvent(new CustomEvent('playGamesSignedIn', { detail: { displayName: %s, playerId: %s } }));",
                                JSONObject.quote(displayName),
                                JSONObject.quote(playerId)
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
