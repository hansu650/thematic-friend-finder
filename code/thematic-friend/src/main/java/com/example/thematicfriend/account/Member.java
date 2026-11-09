package com.example.thematicfriend.account;

import jakarta.persistence.*;
import java.util.Arrays;
import java.util.List;

@Entity
@Table(name = "members")
public class Member {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 24)
    private String username;
    @Column(nullable = false)
    private String passwordHash;
    @Column(nullable = false, length = 30)
    private String nickname;
    @Column(nullable = false, length = 300)
    private String bio = "";
    @Column(nullable = false, length = 200)
    private String interests = "";
    @Column(nullable = false, length = 30)
    private String goal = "New friends";
    private boolean discoverable = true;

    protected Member() { }
    public Member(String username, String passwordHash, String nickname) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.nickname = nickname;
    }
    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getPasswordHash() { return passwordHash; }
    public String getNickname() { return nickname; }
    public String getBio() { return bio; }
    public String getGoal() { return goal; }
    public boolean isDiscoverable() { return discoverable; }
    public List<String> getInterests() {
        return interests.isBlank() ? List.of() : Arrays.asList(interests.split(","));
    }
    public String getInitial() { return nickname.substring(0, nickname.offsetByCodePoints(0, 1)); }
    public int getPalette() { return id == null ? 0 : (int) (id % 5); }
    void changePasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public void updateProfile(String nickname, String bio, List<String> interests, String goal, boolean discoverable) {
        this.nickname = nickname.strip();
        this.bio = bio.strip();
        this.interests = String.join(",", interests);
        this.goal = goal;
        this.discoverable = discoverable;
    }
}
