package com.example.thematicfriend.discovery;

import com.example.thematicfriend.account.*;
import com.example.thematicfriend.connection.*;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class DiscoveryService {
    public record Candidate(Member member,List<String> shared,int score) { }
    private final AccountService accounts;
    private final MemberRepository members;
    private final DecisionRepository decisions;
    private final ConnectionRepository connections;
    private final PairGuard guard;
    public DiscoveryService(AccountService accounts,MemberRepository members,DecisionRepository decisions,ConnectionRepository connections,PairGuard guard) {
        this.accounts=accounts; this.members=members; this.decisions=decisions; this.connections=connections; this.guard=guard;
    }
    public static String validInterest(String value) { return value!=null&&AccountService.INTERESTS.contains(value)?value:""; }
    public static String validGoal(String value) { return value!=null&&AccountService.GOALS.contains(value)?value:""; }
    public List<Candidate> discover(String username,String interest,String goal) {
        return candidates(username,interest,goal,false);
    }
    /** Only count skipped people who could actually reappear under these filters. */
    public int revisitableSkips(String username,String interest,String goal) {
        return candidates(username,interest,goal,true).size();
    }
    private List<Candidate> candidates(String username,String interest,String goal,boolean skippedOnly) {
        Member actor=accounts.current(username);
        Set<Long> excluded=new HashSet<>();
        Set<Long> skipped=new HashSet<>();
        excluded.add(actor.getId());
        decisions.findByActorId(actor.getId()).forEach(d -> {
            if (d.getChoice()==Decision.Choice.SKIP) skipped.add(d.getTargetId());
            if (!skippedOnly || d.getChoice()==Decision.Choice.LIKE) excluded.add(d.getTargetId());
        });
        connections.findByLowIdOrHighIdOrderByCreatedAtDesc(actor.getId(),actor.getId()).forEach(c -> excluded.add(c.other(actor.getId())));
        String selectedInterest=validInterest(interest),selectedGoal=validGoal(goal);
        return members.findAll().stream().filter(Member::isDiscoverable).filter(m -> !excluded.contains(m.getId()))
                .filter(m -> !skippedOnly || skipped.contains(m.getId()))
                .filter(m -> !guard.blocked(actor.getId(),m.getId()))
                .filter(m -> selectedInterest.isBlank()||m.getInterests().contains(selectedInterest))
                .filter(m -> selectedGoal.isBlank()||m.getGoal().equals(selectedGoal))
                .map(m -> {
                    List<String> shared=m.getInterests().stream().filter(actor.getInterests()::contains).toList();
                    return new Candidate(m,shared,shared.size()*2+(actor.getGoal().equals(m.getGoal())?1:0));
                }).sorted(Comparator.comparingInt(Candidate::score).reversed().thenComparing(c -> c.member().getId())).toList();
    }
}
