package com.example.thematicfriend.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.i18n.SessionLocaleResolver;
import java.util.Locale;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    private final boolean chineseEnabled;
    public WebConfig(@Value("${app.chinese-enabled:true}") boolean chineseEnabled) {
        this.chineseEnabled = chineseEnabled;
    }
    @Bean
    public LocaleResolver localeResolver() {
        SessionLocaleResolver resolver = new SessionLocaleResolver();
        resolver.setDefaultLocale(Locale.ENGLISH);
        return resolver;
    }
    @Bean
    public LocalValidatorFactoryBean validator(MessageSource messages) {
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.setValidationMessageSource(messages);
        return validator;
    }
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new HandlerInterceptor() {
            @Override
            public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
                String language = request.getParameter("lang");
                if (!chineseEnabled || "en".equals(language)) {
                    localeResolver().setLocale(request, response, Locale.ENGLISH);
                } else if ("zh".equals(language)) {
                    localeResolver().setLocale(request, response, Locale.SIMPLIFIED_CHINESE);
                }
                return true;
            }
        });
    }
}
