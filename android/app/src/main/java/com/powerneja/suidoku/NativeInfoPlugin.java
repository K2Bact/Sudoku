package com.powerneja.suidoku;

import android.os.Build;
import android.view.View;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * What the web layer cannot see for itself: the navigation bar's height and the
 * Android version.
 *
 * Needed for the banner (BACKLOG U-1). On Android 15+ the AdMob plugin adds the
 * navigation bar inset to the banner's bottom margin, assuming an edge-to-edge
 * window. MainActivity already pads the content above the navigation bar, so the
 * inset was applied twice and the banner floated ~50dp above the bottom with a
 * dark band beneath it — and above the slot the layout had reserved for it.
 * env(safe-area-inset-bottom) reads 0 here for the same reason (the WebView is
 * already inset), so the web side has to ask.
 */
@CapacitorPlugin(name = "NativeInfo")
public class NativeInfoPlugin extends Plugin {

    @PluginMethod
    public void get(PluginCall call) {
        JSObject ret = new JSObject();
        int navDp = 0;
        try {
            View root = getActivity().getWindow().getDecorView();
            WindowInsetsCompat insets = ViewCompat.getRootWindowInsets(root);
            if (insets != null) {
                Insets bars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
                float density = getContext().getResources().getDisplayMetrics().density;
                navDp = Math.round(bars.bottom / density);
            }
        } catch (Exception ignored) {
            // no insets yet: report 0 and let the caller keep the plugin's default
        }
        ret.put("navInsetDp", navDp);
        ret.put("sdkInt", Build.VERSION.SDK_INT);
        call.resolve(ret);
    }
}
