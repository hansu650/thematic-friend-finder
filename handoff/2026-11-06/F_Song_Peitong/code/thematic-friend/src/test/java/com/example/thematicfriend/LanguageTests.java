package com.example.thematicfriend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:language-tests;DB_CLOSE_DELAY=-1","spring.jpa.hibernate.ddl-auto=create-drop"})
@AutoConfigureMockMvc
class LanguageTests {
    @Autowired MockMvc mvc;
    @Test void englishIsDefaultEvenForAChineseBrowser() throws Exception {
        mvc.perform(get("/login").header("Accept-Language","zh-CN"))
                .andExpect(status().isOk()).andExpect(content().string(containsString("Sign in to Mingle")))
                .andExpect(content().string(containsString("lang=zh")));
    }
    @Test void choicePersistsAndCanSwitchBack() throws Exception {
        var result=mvc.perform(get("/login").param("lang","zh")).andExpect(status().isOk())
                .andExpect(content().string(containsString("登录 Mingle"))).andReturn();
        MockHttpSession session=(MockHttpSession)result.getRequest().getSession(false);
        mvc.perform(get("/signup").session(session)).andExpect(content().string(containsString("创建你的账号")));
        mvc.perform(get("/login").param("lang","en").session(session))
                .andExpect(content().string(containsString("Sign in to Mingle")));
    }
    @Test void validationUsesTheSelectedLanguage() throws Exception {
        mvc.perform(post("/signup").with(csrf()).param("lang","en").param("username","!")
                .param("nickname","Test").param("password","short"))
                .andExpect(status().isOk()).andExpect(content().string(containsString("Use a password of 10–64 characters.")));
        mvc.perform(post("/signup").with(csrf()).param("lang","zh").param("username","!")
                .param("nickname","Test").param("password","short"))
                .andExpect(status().isOk()).andExpect(content().string(containsString("密码需要 10–64 个字符")));
    }
    @Test void unknownLanguageLeavesEnglishSelected() throws Exception {
        mvc.perform(get("/login").param("lang","not-a-language"))
                .andExpect(status().isOk()).andExpect(content().string(containsString("Sign in to Mingle")));
    }
}
