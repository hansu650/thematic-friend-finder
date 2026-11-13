package com.example.thematicfriend.account;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ChangePasswordForm {
    @NotBlank(message = "{ui.current_password_required}")
    private String currentPassword = "";
    @NotBlank(message = "{ui.new_password_required}")
    @Size(min = 10, max = 64, message = "{ui.use_a_password_of_10_64_characters}")
    private String newPassword = "";
    @NotBlank(message = "{ui.confirm_password_required}")
    private String confirmation = "";
    public String getCurrentPassword() { return currentPassword; }
    public void setCurrentPassword(String value) { currentPassword = value; }
    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String value) { newPassword = value; }
    public String getConfirmation() { return confirmation; }
    public void setConfirmation(String value) { confirmation = value; }
}
