package com.example.thematicfriend.connection;
import com.example.thematicfriend.account.MemberRepository;
import com.example.thematicfriend.safety.BlockRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

/** Serialize contact mutations in a consistent order, including blocking and sending. */
@Component
public class PairGuard {
    private final MemberRepository members;
    private final BlockRepository blocks;
    public PairGuard(MemberRepository members, BlockRepository blocks) { this.members=members; this.blocks=blocks; }
    public void lock(Long a, Long b) {
        if (a.equals(b)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ui.you_cannot_perform_this_action_on_yourself");
        members.lockById(Math.min(a,b)).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        members.lockById(Math.max(a,b)).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
    public boolean blocked(Long a, Long b) {
        return blocks.existsByActorIdAndTargetId(a,b)||blocks.existsByActorIdAndTargetId(b,a);
    }
}
