#include <pebble.h>
#define KEY_AUTH_TOKEN 0
#define KEY_REFRESH_TOKEN 1
#define KEY_AUTH_FAILED 2
#define KEY_QUICKNOTE_TEXT 3

static Window *s_main_window;
static TextLayer *s_text_layer;

static char *s_auth_token;
static char *s_refresh_token;

static DictationSession *s_dictation_session;
static char s_dictation_transcription[512];
static DictationSessionStatus s_dictation_status;

static char *s_quicknote_text;

static void dictation_session_callback(DictationSession *session, DictationSessionStatus status, char *transcription, void *context) {
	APP_LOG(APP_LOG_LEVEL_INFO, "Dictation status: %d", (int)status);

	s_dictation_status = status;

	if (status == DictationStatusSuccess) {
		snprintf(s_dictation_transcription, sizeof(s_dictation_transcription), "%s", transcription);
	}
	else {
		static char s_failed_buff[128];
		snprintf(s_failed_buff, sizeof(s_failed_buff), "Transcription faild.\n\nReason:\n%d", (int)status);
		text_layer_set_text(s_text_layer, s_failed_buff);
	}
}

static void select_click_handler(ClickRecognizerRef recongnizer, void *context) {
	APP_LOG(APP_LOG_LEVEL_INFO, "Dictation event started.");
	vibes_short_pulse();
	
	dictation_session_start(s_dictation_session);
	if (s_dictation_status == DictationStatusSuccess) {
		s_quicknote_text = s_dictation_transcription;

		DictionaryIterator *iterator;
		app_message_outbox_begin(&iterator);
		dict_write_cstring(iterator, KEY_REFRESH_TOKEN, s_refresh_token);
		dict_write_cstring(iterator, KEY_QUICKNOTE_TEXT, s_quicknote_text);

		app_message_outbox_send();
	}
}

static void click_config_provider(void *context) {
	window_single_click_subscribe(BUTTON_ID_SELECT, select_click_handler);
}

static void inbox_received_callback(DictionaryIterator *iterator, void *context) {
	Tuple *authToken = dict_find(iterator, KEY_AUTH_TOKEN);
	Tuple *refreshToken = dict_find(iterator, KEY_REFRESH_TOKEN);

	if (authToken) {
		APP_LOG(APP_LOG_LEVEL_INFO, "KEY_AUTH_TOKEN recieved with value %d", (int)authToken->value->int32);
		s_auth_token = authToken->value->char;
	}
	else {
		APP_LOG(APP_LOG_LEVEL_INFO, "KEY_AUTH_TOKEN not recieved.");
	}

	if (refreshToken) {
		APP_LOG(APP_LOG_LEVEL_INFO, "KEY_REFRESH_TOKEN recieved with value %d", (int)refreshToken->value->int32);
		s_refresh_token = refreshToken->value->char;
	}
	else {
		APP_LOG(APP_LOG_LEVEL_INFO, "KEY_REFRESH_TOKEN not recieved.");
	}
}

static void inbox_dropped_callback(AppMessageResult reason, void *context) {
	APP_LOG(APP_LOG_LEVEL_ERROR, "Message dropped!");
}

static void outbox_failed_callback(DictionaryIterator *iterator, AppMessageResult reason, void *context) {
	APP_LOG(APP_LOG_LEVEL_ERROR, "Outbox send failed!");
}

static void outbox_sent_callback(DictionaryIterator *iterator, void *context) {
	APP_LOG(APP_LOG_LEVEL_INFO, "Outbox send success!");
}

static void main_window_load(Window *window) {
	Layer *window_layer = window_get_root_layer(window);
	GRect bounds = layer_get_bounds(window_layer);

	s_text_layer = text_layer_create(GRect(0, PBL_IF_ROUND_ELSE(58, 52), bounds.size.w, bounds.size.h - 15));

	text_layer_set_background_color(s_text_layer, GColorClear);
	text_layer_set_text_color(s_text_layer, GColorBlack);
	text_layer_set_text(s_text_layer, "Press select to dictate a note to add to your quick notes in your default notebook.");
	text_layer_set_text_alignment(s_text_layer, GTextAlignmentCenter);

	//set font

	layer_add_child(window_layer, text_layer_get_layer(s_text_layer));

	//button click callbacks
	window_set_click_config_provider(s_main_window, click_config_provider);
}

static void main_window_unload(Window *window) {
	text_layer_destroy(s_text_layer);
}

static void init() {
	s_main_window = window_create();
	window_set_window_handlers(s_main_window, (WindowHandlers) {
		.load = main_window_load,
		.unload = main_window_unload,
	});

	window_stack_push(s_main_window, true);

	//set up dictation session
	s_dictation_session = dictation_session_create(sizeof(s_dictation_transcription), dictation_session_callback, NULL);

	//read data, unsure about nullptr's
	s_auth_token = persist_exists(KEY_AUTH_TOKEN) ? persist_read_string(KEY_AUTH_TOKEN) : nullptr;
	s_refresh_token = persist_exists(KEY_REFRESH_TOKEN) ? persist_read_string(KEY_REFRESH_TOKEN) : nullptr;

	//register callbacks
	app_message_register_inbox_received(inbox_received_callback);
	app_message_register_inbox_dropped(inbox_dropped_callback);
	app_message_register_outbox_failed(outbox_failed_callback);
	app_message_register_outbox_sent(outbox_sent_callback);

	app_message_open(app_message_inbox_size_maximum(), app_message_outbox_size_maximum());
}

static void deinit() {
	window_destroy(s_main_window);

	dictation_session_destroy(s_dictation_session);

	//write data
	persist_write_string(KEY_AUTH_TOKEN, s_auth_token);
	persist_write_string(KEY_REFRESH_TOKEN, s_refresh_token);

}

int main(void) {
	init();
	app_event_loop();
	deinit();
}
