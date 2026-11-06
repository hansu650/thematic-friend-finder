package com.example.thematicfriend.safety;

import com.example.thematicfriend.account.*;
import com.example.thematicfriend.connection.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class SafetyService {
    public static final List<String> REASONS=List.of("Harassment","Fake profile","Inappropriate content","Other concern");
    private final AccountService accounts;
    private final BlockRepository blocks;
    private final ReportRepository reports;
    private final ConnectionRepository connections;
    private final PairGuard guard;
    public SafetyService(AccountService accounts,BlockRepository blocks,ReportRepository reports,ConnectionRepository connections,PairGuard guard) {
        this.accounts=accounts; this.blocks=blocks; this.reports=reports; this.connections=connections; this.guard=guard;
    }
    public Member reportTarget(String username,Long target) {
        Member actor=accounts.current(username),other=accounts.member(target);
        boolean known=connections.findByLowIdAndHighId(Math.min(actor.getId(),target),Math.max(actor.getId(),target)).isPresent()
                ||blocks.existsByActorIdAndTargetId(actor.getId(),target);
        if (actor.getId().equals(target)||(!other.isDiscoverable()&&!known)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return other;
    }
    @Transactional
    public void block(String username,Long target) {
        Long actor=accounts.current(username).getId();
        guard.lock(actor,target);
        reportTarget(username,target);
        if (!blocks.existsByActorIdAndTargetId(actor,target)) blocks.save(new Block(actor,target));
        connections.findByLowIdAndHighId(Math.min(actor,target),Math.max(actor,target)).ifPresent(Connection::end);
    }
    @Transactional
    public void unblock(String username,Long target) {
        Long actor=accounts.current(username).getId();
        guard.lock(actor,target);
        blocks.deleteByActorIdAndTargetId(actor,target);
    }
    @Transactional
    public void report(String username,Long target,String reason,String details) {
        reportTarget(username,target);
        if (!REASONS.contains(reason)||details==null||details.length()>1000) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"ui.select_a_valid_report_reason_and_use_no_more_than_1000_characters");
        reports.save(new Report(accounts.current(username).getId(),target,reason,details.strip()));
    }
    public List<Member> blocked(String username) { return blocks.findByActorId(accounts.current(username).getId()).stream().map(b -> accounts.member(b.getTargetId())).toList(); }
    public List<Report> reports(String username) { return reports.findByReporterIdOrderByCreatedAtDesc(accounts.current(username).getId()); }
}
