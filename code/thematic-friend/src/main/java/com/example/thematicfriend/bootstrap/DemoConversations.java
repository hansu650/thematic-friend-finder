package com.example.thematicfriend.bootstrap;

import com.example.thematicfriend.account.*;
import com.example.thematicfriend.chat.ChatService;
import com.example.thematicfriend.connection.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/** Optional review fixtures: real mutual connections, no automatic replies. */
@Component
@Profile("demo")
@Order(20)
@ConditionalOnProperty(name="app.demo-conversations", havingValue="true")
public class DemoConversations implements CommandLineRunner {
    private final MemberRepository members;
    private final PasswordEncoder encoder;
    private final ConnectionRepository links;
    private final ConnectionService connections;
    private final DecisionRepository decisions;
    private final PairGuard guard;
    private final ChatService chat;
    private final String password;
    public DemoConversations(MemberRepository members, PasswordEncoder encoder, ConnectionRepository links,
                             ConnectionService connections, DecisionRepository decisions, PairGuard guard, ChatService chat, @Value("${app.demo-password}") String password) {
        this.members=members; this.encoder=encoder; this.links=links; this.connections=connections; this.decisions=decisions; this.guard=guard; this.chat=chat; this.password=password;
    }
    @Override @Transactional
    public void run(String... args) {
        add("demo_aria", "Aria", "A coffee, a camera, and a day with no plans. Tell me about a place you love.", List.of("Coffee","Photography","Travel"), "New friends");
        add("demo_theo", "Theo", "Finding new trails and the best noodles after a hike. Always up for a weekend outdoors.", List.of("Hiking","Food","Photography"), "Weekend plans");
        add("demo_maya", "Maya", "Collecting songs and little stories. Currently looking for a reading buddy.", List.of("Reading","Music","Coffee"), "Study buddy");
        add("demo_leo", "Leo", "A film night, a good playlist and a thoughtful conversation. What are you watching lately?", List.of("Films","Music","Travel"), "New friends");
        add("demo_iris", "Iris", "Weekends are for parks and my camera. Lately I have been collecting photographs of interesting windows.", List.of("Photography","Art","Coffee"), "Weekend plans");
        add("demo_luca", "Luca", "I like cycling to little places I have never tried. Coffee and good bread are always a reason to go out.", List.of("Coffee","Food","Travel"), "New friends");
        add("demo_nora", "Nora", "Reading a very long novel and slowly learning to keep plants alive. Looking for someone to swap book recommendations with.", List.of("Reading","Art","Hiking"), "Study buddy");
        add("demo_eli", "Eli", "My playlists keep changing. I enjoy live music and the conversation over a late meal afterwards.", List.of("Music","Food","Films"), "New friends");
        add("demo_sora", "Sora", "I stop for good light and small details. Always happy to visit a gallery together.", List.of("Photography","Art","Travel"), "Weekend plans");
        add("demo_milo", "Milo", "Away from work, you will find me with a board game or a film. Happy to explain the rules and hear your recommendations.", List.of("Gaming","Films","Coffee"), "New friends");
        add("demo_hazel", "Hazel", "I like quiet bookshops and lively dinners with friends. Both make a good weekend.", List.of("Reading","Food","Coffee"), "New friends");
        add("demo_finn", "Finn", "Collecting old records and travel stories. I like leaving a little time for somewhere new.", List.of("Music","Travel","Photography"), "Weekend plans");
        add("demo_mia", "Mia", "Learning to make pour-over coffee. Find a window seat and tell me about your week.", List.of("Coffee","Reading","Art"), "New friends");
        add("demo_jules", "Jules", "After a film, I still want another half hour to talk. I enjoy long walks and planning the next trip.", List.of("Films","Hiking","Travel"), "Weekend plans");
        add("demo_avery", "Avery", "Morning runs and afternoon galleries. Looking for someone to make exercise a regular habit with.", List.of("Sport","Art","Music"), "Workout buddy");
        add("demo_rowan", "Rowan", "Often on a trail at the weekend, then looking for a good meal back in town. An easy route sounds perfect.", List.of("Hiking","Food","Photography"), "Weekend plans");
        add("demo_jade", "Jade", "Learning pottery; sometimes the cup becomes a small bowl. I like sharing the imperfect things we make.", List.of("Art","Coffee","Reading"), "New friends");
        add("demo_noel", "Noel", "Happy with a gentle run or a good game. Up for meeting new people over a weekend board game.", List.of("Sport","Gaming","Food"), "Workout buddy");
        add("demo_lena", "Lena", "Photographing ordinary days and looking for the next cafe with a good reading corner.", List.of("Photography","Reading","Coffee"), "Study buddy");
        add("demo_kai", "Kai", "I enjoy hiking and whatever we find along the way. The conversation matters more than the distance.", List.of("Hiking","Travel","Sport"), "Workout buddy");
        add("demo_riley", "Riley", "Markets, flowers and outdoor films. A weekend is a good time to discover a new little place.", List.of("Food","Films","Art"), "Weekend plans");
        add("demo_parker", "Parker", "Books, jazz and occasionally trying a new recipe. I would love to hear your favourite recommendation.", List.of("Reading","Music","Food"), "New friends");
        connect("demo_zhou", "demo_lin", new String[][] {
            {"demo_lin", "Hey Jamie! I noticed we both like coffee and reading ☕"},
            {"demo_zhou", "That is a very good start. Do you have a favourite cafe?"},
            {"demo_lin", "Somewhere with a window seat and a small bookshelf. What are you reading?"},
            {"demo_zhou", "A book about slow travel. I keep getting distracted by the photos 😄"},
            {"demo_lin", "[[sticker:coffee]]"},
            {"demo_lin", "Coffee, a window seat and a good book. That sounds like my kind of weekend."}
        });
        connect("demo_zhou", "demo_chen", new String[][] {
            {"demo_chen", "Any good film recommendations for the weekend? 🎬"},
            {"demo_zhou", "I am making a little watchlist. Send me your favourite!"}
        });
        connect("demo_lin", "demo_su", new String[][] {
            {"demo_su", "Found a bookshop with a tiny record corner today."},
            {"demo_lin", "Books and music in the same place? That sounds perfect."}
        });
    }
    private void add(String username, String nickname, String bio, List<String> interests, String goal) {
        if (members.existsByUsername(username)) return;
        Member member=new Member(username,encoder.encode(password),nickname);
        member.updateProfile(nickname,bio,interests,goal,true);
        members.saveAndFlush(member);
    }
    private void connect(String first, String second, String[][] conversation) {
        Member a=members.findByUsername(first).orElseThrow(), b=members.findByUsername(second).orElseThrow();
        // An existing, ended or blocked conversation is never recreated or repopulated.
        if (links.findByLowIdAndHighId(Math.min(a.getId(),b.getId()),Math.max(a.getId(),b.getId())).isPresent()) return;
        if (!a.isDiscoverable() || !b.isDiscoverable() || guard.blocked(a.getId(),b.getId())) return;
        // Even a prior skip or a one-sided like belongs to the person reviewing the app.
        if (decisions.findByActorIdAndTargetId(a.getId(),b.getId()).isPresent()
                || decisions.findByActorIdAndTargetId(b.getId(),a.getId()).isPresent()) return;
        connections.decide(first,b.getId(),Decision.Choice.LIKE);
        Connection link=connections.decide(second,a.getId(),Decision.Choice.LIKE).orElseThrow();
        for (String[] line:conversation) chat.send(line[0],link.getId(),line[1]);
    }
}
