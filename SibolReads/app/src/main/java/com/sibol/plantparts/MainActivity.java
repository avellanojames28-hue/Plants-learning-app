package com.sibol.plantparts;

import android.app.Activity;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.util.Locale;

/** Runs Sibol's School full-screen with a cheerful native voice in English and Filipino. */
public class MainActivity extends Activity {
    private WebView web;
    private TextToSpeech tts;
    private boolean ttsReady = false;
    private Voice enVoice, filVoice;
    private Locale filLocale = null;
    private float rateMul = 1f;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        tts = new TextToSpeech(this, status -> {
            if (status != TextToSpeech.SUCCESS) return;
            tts.setLanguage(Locale.US);
            tts.setPitch(1.3f);
            for (Locale l : new Locale[]{new Locale("fil", "PH"), new Locale("tl", "PH"), new Locale("fil"), new Locale("tl")}) {
                int r = tts.isLanguageAvailable(l);
                if (r >= TextToSpeech.LANG_AVAILABLE) { filLocale = l; break; }
            }
            try {
                for (Voice v : tts.getVoices()) {
                    String n = v.getName().toLowerCase(Locale.ROOT);
                    String lang = v.getLocale().getLanguage();
                    if (v.isNetworkConnectionRequired()) continue;
                    if (enVoice == null && lang.equals("en") && v.getLocale().getCountry().equals("US")
                            && (n.contains("sfg") || n.contains("tpf") || n.contains("female"))) enVoice = v;
                    if (filVoice == null && (lang.equals("fil") || lang.equals("tl"))) filVoice = v;
                }
            } catch (Exception ignored) { }
            tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                @Override public void onStart(String id) { }
                @Override public void onDone(String id) { done(id); }
                @Override public void onError(String id) { done(id); }
                @Override public void onStop(String id, boolean interrupted) { done(id); }
            });
            ttsReady = true;
        });

        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(true);
        web.setWebViewClient(new WebViewClient());
        web.addJavascriptInterface(new Speaker(), "AndroidTTS");
        web.setBackgroundColor(0xFFE3F3FA);
        setContentView(web);
        hideBars();
        web.loadUrl("file:///android_asset/index.html");
    }

    private void done(String id) {
        if (id == null || !id.startsWith("u")) return;
        runOnUiThread(() -> web.evaluateJavascript("window.__ttsDone&&__ttsDone('" + id + "')", null));
    }

    private void hideBars() {
        web.setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
    }

    @Override public void onWindowFocusChanged(boolean hasFocus) { super.onWindowFocusChanged(hasFocus); if (hasFocus) hideBars(); }

    @Override public void onBackPressed() {
        web.evaluateJavascript("window.appBack?appBack():0", r -> { if (!"1".equals(r)) finish(); });
    }

    @Override protected void onPause() { super.onPause(); if (tts != null) tts.stop(); }
    @Override protected void onDestroy() { if (tts != null) tts.shutdown(); super.onDestroy(); }

    class Speaker {
        @JavascriptInterface public void speak(String text) { speakLang(text, "en", "x"); }
        @JavascriptInterface public void speakLang(String text, String lang, String id) {
            if (!ttsReady) { done(id); return; }
            if ("fil".equals(lang) && (filVoice != null || filLocale != null)) {
                if (filVoice != null) tts.setVoice(filVoice); else tts.setLanguage(filLocale);
                tts.setSpeechRate(0.86f);
            } else {
                if (enVoice != null) tts.setVoice(enVoice); else tts.setLanguage(Locale.US);
                tts.setSpeechRate(0.92f * rateMul);
            }
            tts.setPitch(1.3f);
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, id);
        }
        @JavascriptInterface public void setRate(float r) { rateMul = r; }
        @JavascriptInterface public void stop() { if (ttsReady) tts.stop(); }
    }
}
