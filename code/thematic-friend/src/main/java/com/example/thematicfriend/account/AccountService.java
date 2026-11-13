package com.example.thematicfriend.account;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Locale;

@Service
public class AccountService {
    public static final List<String> INTERESTS = List.of("Coffee", "Reading", "Films", "Music", "Photography", "Travel", "Sport", "Gaming", "Food", "Hiking", "Art");
    public static final List<String> GOALS = List.of("New friends", "Study buddy", "Workout buddy", "Weekend plans");
    private final MemberRepository members;
    private final PasswordEncoder encoder;
    public AccountService(MemberRepository members, PasswordEncoder encoder) {
        this.members = members; this.encoder = encoder;
    }
    public Member current(String username) {
        return members.findByUsername(username).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }
    public Member member(Long id) {
        return members.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ui.this_person_was_not_found"));
    }
    @Transactional
    public Member register(SignupForm form) {
        return members.saveAndFlush(new Member(form.getUsername().toLowerCase(Locale.ROOT), encoder.encode(form.getPassword()), form.getNickname().strip()));
    }
    @Transactional
    public boolean changePassword(String username, String currentPassword, String newPassword) {
        Member member = current(username);
        if (!encoder.matches(currentPassword, member.getPasswordHash())) return false;
        member.changePasswordHash(encoder.encode(newPassword));
        return true;
    }
    @Transactional
    public void update(String username, ProfileForm form) {
        if (!GOALS.contains(form.getGoal()) || !INTERESTS.containsAll(form.getInterests())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ui.choose_interests_and_an_activity_from_the_lists");
        }
        current(username).updateProfile(form.getNickname(), form.getBio(), form.getInterests().stream().distinct().toList(), form.getGoal(), form.isDiscoverable());
    }
}
