package com.powerneja.suidoku;

import android.os.Bundle;
import android.util.Log;
import com.getcapacitor.BridgeActivity;
import com.google.android.gms.games.PlayGamesSdk;
import com.google.android.gms.games.PlayGames;
import com.google.android.gms.games.GamesSignInClient;
import com.google.android.gms.games.PlayersClient;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "SuidokuPlayGames";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

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

            // 2. Automatic Silent Sign-In (Release only to avoid unlinked debug package picker)
            GamesSignInClient gamesSignInClient = PlayGames.getGamesSignInClient(this);
            gamesSignInClient.isAuthenticated().addOnCompleteListener(isAuthenticatedTask -> {
                try {
                    boolean isAuthenticated = (isAuthenticatedTask.isSuccessful() && isAuthenticatedTask.getResult() != null && isAuthenticatedTask.getResult().isAuthenticated());
                    boolean isDebug = (getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0;
                    if (isAuthenticated) {
                        Log.i(TAG, "Play Games already authenticated!");
                        requestPlayerInfo();
                    } else if (!isDebug) {
                        Log.i(TAG, "Play Games attempting silent sign-in...");
                        gamesSignInClient.signIn().addOnCompleteListener(signInTask -> {
                            try {
                                if (signInTask.isSuccessful() && signInTask.getResult() != null && signInTask.getResult().isAuthenticated()) {
                                    Log.i(TAG, "Play Games sign-in successful!");
                                    requestPlayerInfo();
                                } else {
                                    Log.w(TAG, "Play Games sign-in failed or cancelled");
                                }
                            } catch (Exception ignored) {}
                        });
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
