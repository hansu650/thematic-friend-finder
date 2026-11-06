package com.example.thematicfriend.account;

import jakarta.validation.constraints.*;
import java.util.ArrayList;
import java.util.List;

public class ProfileForm {
    @NotBlank(message = "{ui.enter_a_display_name}") @Size(max = 30, message = "{ui.use_no_more_than_30_characters_for_your_display_name}")
    private String nickname = "";
    @Size(max = 300, message = "{ui.your_bio_can_contain_up_to_300_characters}")
    private String bio = "";
    @Size(max = 5, message = "{ui.choose_up_to_5_interests}")
    private List<String> interests = new ArrayList<>();
    private String goal = "New friends";
    private boolean discoverable = true;
    public ProfileForm() { }
    public ProfileForm(Member member) {
        nickname = member.getNickname(); bio = member.getBio();
        interests = new ArrayList<>(member.getInterests());
        goal = member.getGoal(); discoverable = member.isDiscoverable();
    }
    public String getNickname() { return nickname; }
    public void setNickname(String v) { nickname = v; }
    public String getBio() { return bio; }
    public void setBio(String v) { bio = v; }
    public List<String> getInterests() { return interests; }
    public void setInterests(List<String> v) { interests = v == null ? new ArrayList<>() : v; }
    public String getGoal() { return goal; }
    public void setGoal(String v) { goal = v; }
    public boolean isDiscoverable() { return discoverable; }
    public void setDiscoverable(boolean v) { discoverable = v; }
}
