package com.example.thematicfriend.account;

import jakarta.validation.constraints.*;

public class SignupForm {
    @Pattern(regexp = "[a-zA-Z0-9_]{3,24}", message = "{ui.use_3_24_letters_numbers_or_underscores_for_your_username}")
    private String username = "";
    @Size(min = 10, max = 64, message = "{ui.use_a_password_of_10_64_characters}")
    private String password = "";
    @NotBlank(message = "{ui.enter_a_display_name}")
    @Size(max = 30, message = "{ui.use_no_more_than_30_characters_for_your_display_name}")
    private String nickname = "";
    @AssertTrue(message = "{ui.please_confirm_that_you_are_18_or_over}")
    private boolean adult;
    public String getUsername() { return username; }
    public void setUsername(String v) { username = v; }
    public String getPassword() { return password; }
    public void setPassword(String v) { password = v; }
    public String getNickname() { return nickname; }
    public void setNickname(String v) { nickname = v; }
    public boolean isAdult() { return adult; }
    public void setAdult(boolean v) { adult = v; }
}
