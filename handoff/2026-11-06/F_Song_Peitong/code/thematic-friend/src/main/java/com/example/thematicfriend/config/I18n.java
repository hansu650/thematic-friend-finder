package com.example.thematicfriend.config;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Component("i18n")
public class I18n {
    private final MessageSource messages;
    public I18n(MessageSource messages) { this.messages = messages; }
    public String text(String key) {
        return messages.getMessage(key, null, key, LocaleContextHolder.getLocale());
    }
    public String option(String value) {
        String key = "option." + value.toLowerCase(Locale.ROOT).replace(' ', '_');
        return messages.getMessage(key, null, value, LocaleContextHolder.getLocale());
    }
    public String join(List<String> values) {
        return values.stream().map(this::option).collect(Collectors.joining(", "));
    }
}
