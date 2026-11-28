package com.example.thematicfriend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.servlet.i18n.SessionLocaleResolver;
import java.util.Locale;
import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:english-delivery;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop", "app.chinese-enabled=false"})
@AutoConfigureMockMvc
class EnglishDeliveryTests {
    @Autowired MockMvc mvc;

    @Test void finalModeOverridesBrowserQueryAndExistingChineseSession() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute(SessionLocaleResolver.LOCALE_SESSION_ATTRIBUTE_NAME, Locale.SIMPLIFIED_CHINESE);
        mvc.perform(get("/login").session(session).param("lang", "zh").header("Accept-Language", "zh-CN"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Sign in to Mingle")))
                .andExpect(content().string(not(containsString("lang=zh"))))
                .andExpect(content().string(not(containsString("登录 Mingle"))));
        mvc.perform(get("/").session(session).param("lang", "zh"))
                .andExpect(content().string(containsString("Find friends")))
                .andExpect(content().string(containsString("Meet up over a shared hobby.")));
    }

    @Test void finalModeKeepsValidationInEnglish() throws Exception {
        mvc.perform(post("/signup").with(csrf()).param("lang", "zh").param("username", "!")
                .param("nickname", "Test").param("password", "short"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Use a password of 10–64 characters.")))
                .andExpect(content().string(not(containsString("密码需要"))));
    }
}
