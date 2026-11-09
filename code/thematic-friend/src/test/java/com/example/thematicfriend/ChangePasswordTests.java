package com.example.thematicfriend;

import com.example.thematicfriend.account.Member;
import com.example.thematicfriend.account.MemberRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockHttpSession;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:password-test;DB_CLOSE_DELAY=-1", "spring.jpa.hibernate.ddl-auto=create-drop"})
@AutoConfigureMockMvc
class ChangePasswordTests {
    @Autowired MockMvc mvc;
    @Autowired MemberRepository members;
    @Autowired PasswordEncoder encoder;
    final String oldPassword = "Old-password-2026";
    final String newPassword = "New-password-2026";
    @BeforeEach void setup() {
        members.deleteAll();
        members.saveAndFlush(new Member("testuser", encoder.encode(oldPassword), "Test User"));
    }
    String hash() { return members.findByUsername("testuser").orElseThrow().getPasswordHash(); }
    @Test void validChangeReplacesHashAndSignsOutCurrentSession() throws Exception {
        MockHttpSession session = (MockHttpSession) mvc.perform(post("/login").with(csrf())
                .param("username","testuser").param("password",oldPassword)).andReturn().getRequest().getSession(false);
        mvc.perform(get("/change-password").session(session)).andExpect(status().isOk());
        mvc.perform(post("/change-password").session(session).with(csrf())
                .param("currentPassword",oldPassword).param("newPassword",newPassword).param("confirmation",newPassword))
                .andExpect(redirectedUrl("/login?passwordChanged"));
        assertThat(session.isInvalid()).isTrue();
        assertThat(encoder.matches(newPassword,hash())).isTrue();
        assertThat(encoder.matches(oldPassword,hash())).isFalse();
        mvc.perform(post("/login").with(csrf()).param("username","testuser").param("password",oldPassword)).andExpect(redirectedUrl("/login?error"));
        mvc.perform(post("/login").with(csrf()).param("username","testuser").param("password",newPassword)).andExpect(redirectedUrl("/discover"));
    }
    @Test void passwordChangeKeepsOtherSessionSignedIn() throws Exception {
        MockHttpSession first = (MockHttpSession) mvc.perform(post("/login").with(csrf())
                .param("username","testuser").param("password",oldPassword)).andReturn().getRequest().getSession(false);
        MockHttpSession second = (MockHttpSession) mvc.perform(post("/login").with(csrf())
                .param("username","testuser").param("password",oldPassword)).andReturn().getRequest().getSession(false);
        mvc.perform(post("/change-password").session(first).with(csrf())
                .param("currentPassword",oldPassword).param("newPassword",newPassword).param("confirmation",newPassword))
                .andExpect(redirectedUrl("/login?passwordChanged"));
        assertThat(first.isInvalid()).isTrue();
        mvc.perform(get("/profile").session(second)).andExpect(status().isOk());
    }
    @Test void wrongCurrentPasswordLeavesCredentialUnchanged() throws Exception {
        String before=hash();
        mvc.perform(post("/change-password").with(user("testuser")).with(csrf())
                .param("currentPassword","wrong-password").param("newPassword",newPassword).param("confirmation",newPassword))
                .andExpect(model().attributeHasFieldErrors("changePasswordForm","currentPassword"))
                .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString(newPassword))));
        assertThat(hash()).isEqualTo(before);
        assertThat(encoder.matches(oldPassword,hash())).isTrue();
    }
    @Test void invalidPasswordsDoNotChangeHash() throws Exception {
        String before=hash();
        for (String password: List.of("", "short", "x".repeat(65), "密".repeat(25))) {
            mvc.perform(post("/change-password").with(user("testuser")).with(csrf())
                    .param("currentPassword",oldPassword).param("newPassword",password).param("confirmation",password))
                    .andExpect(model().attributeHasFieldErrors("changePasswordForm","newPassword"));
            assertThat(hash()).isEqualTo(before);
        }
        mvc.perform(post("/change-password").with(user("testuser")).with(csrf())
                .param("currentPassword",oldPassword).param("newPassword",newPassword).param("confirmation","different-password"))
                .andExpect(model().attributeHasFieldErrors("changePasswordForm","confirmation"));
        assertThat(hash()).isEqualTo(before);
    }
    @Test void protectedAndCsrfRequestsCannotChangeAnotherAccount() throws Exception {
        members.saveAndFlush(new Member("other", encoder.encode(oldPassword), "Other"));
        String otherHash=members.findByUsername("other").orElseThrow().getPasswordHash();
        mvc.perform(get("/change-password")).andExpect(status().is3xxRedirection());
        mvc.perform(post("/change-password").with(user("testuser"))
                .param("currentPassword",oldPassword).param("newPassword",newPassword).param("confirmation",newPassword)).andExpect(status().isForbidden());
        mvc.perform(post("/change-password").with(user("testuser")).with(csrf()).param("id",members.findByUsername("other").orElseThrow().getId().toString())
                .param("currentPassword",oldPassword).param("newPassword",newPassword).param("confirmation",newPassword)).andExpect(status().is3xxRedirection());
        assertThat(members.findByUsername("other").orElseThrow().getPasswordHash()).isEqualTo(otherHash);
    }
}
