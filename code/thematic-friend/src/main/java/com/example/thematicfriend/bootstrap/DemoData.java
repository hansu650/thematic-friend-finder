package com.example.thematicfriend.bootstrap;

import com.example.thematicfriend.account.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.core.annotation.Order;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
@Profile("demo")
@Order(10)
public class DemoData implements CommandLineRunner {
    private final MemberRepository members;
    private final PasswordEncoder encoder;
    private final String password;
    public DemoData(MemberRepository members,PasswordEncoder encoder,@Value("${app.demo-password}") String password) {
        this.members=members; this.encoder=encoder; this.password=password;
    }
    @Override @Transactional
    public void run(String... args) {
        if(password.length()<10||password.getBytes(StandardCharsets.UTF_8).length>72) throw new IllegalStateException("Set TONGPIN_DEMO_PASSWORD to at least 10 characters and no more than 72 UTF-8 bytes for the demo profile");
        add("demo_zhou","Jamie Zhou","Looking for people to explore the city with. Usually reading in a cafe or taking my camera on a long walk.",List.of("Coffee","Reading","Photography"),"New friends");
        add("demo_lin","Alex Lin","Collecting little cafes and thoughtful conversations. Currently reading a book about travel.",List.of("Coffee","Reading","Travel"),"New friends");
        add("demo_xu","Summer Xu","A slow weekend, a park walk and a few photos. What is your favourite route around the city?",List.of("Photography","Hiking","Food"),"Weekend plans");
        add("demo_chen","Noah Chen","Music while coding, films when taking a break. Let us learn together and share new discoveries.",List.of("Music","Films","Gaming"),"Study buddy");
        add("demo_he","Robin He","New to running and looking for a workout buddy. A good meal after the run sounds like a plan.",List.of("Sport","Hiking","Food"),"Workout buddy");
        add("demo_su","Sam Su","Old bookshops, vinyl records and unplanned trips. Always happy to swap reading lists.",List.of("Reading","Music","Travel"),"New friends");
    }
    private void add(String username,String nickname,String bio,List<String> interests,String goal) {
        if(members.existsByUsername(username)) return;
        Member member=new Member(username,encoder.encode(password),nickname);
        member.updateProfile(nickname,bio,interests,goal,true);
        members.save(member);
    }
}
