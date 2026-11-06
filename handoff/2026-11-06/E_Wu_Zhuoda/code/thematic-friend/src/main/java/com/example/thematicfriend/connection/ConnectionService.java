package com.example.thematicfriend.connection;

import com.example.thematicfriend.account.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Optional;

@Service
public class ConnectionService {
    private final AccountService accounts;
    private final DecisionRepository decisions;
    private final ConnectionRepository connections;
    private final PairGuard guard;
    public ConnectionService(AccountService accounts, DecisionRepository decisions, ConnectionRepository connections, PairGuard guard) {
        this.accounts=accounts; this.decisions=decisions; this.connections=connections; this.guard=guard;
    }
    @Transactional
    public Optional<Connection> decide(String username, Long target, Decision.Choice choice) {
        Member actor=accounts.current(username);
        guard.lock(actor.getId(),target);
        if (!accounts.member(target).isDiscoverable()||guard.blocked(actor.getId(),target)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,"ui.this_person_is_not_available_to_connect");
        }
        Optional<Connection> previous=connections.findByLowIdAndHighId(Math.min(actor.getId(),target),Math.max(actor.getId(),target));
        if (previous.isPresent()) {
            if (!previous.get().isActive()) throw new ResponseStatusException(HttpStatus.CONFLICT,"ui.this_connection_has_ended");
            return previous;
        }
        Decision decision=decisions.findByActorIdAndTargetId(actor.getId(),target).orElse(new Decision(actor.getId(),target,choice));
        decision.setChoice(choice);
        decisions.saveAndFlush(decision);
        boolean mutual=choice==Decision.Choice.LIKE && decisions.findByActorIdAndTargetId(target,actor.getId())
                .map(d -> d.getChoice()==Decision.Choice.LIKE).orElse(false);
        return mutual ? Optional.of(connections.saveAndFlush(new Connection(actor.getId(),target))) : Optional.empty();
    }
    public Connection require(Long id, Long actor) {
        Connection link=connections.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"ui.connection_not_found"));
        if (!link.contains(actor)) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"ui.connection_not_found");
        if (!link.isActive()||guard.blocked(link.getLowId(),link.getHighId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,"ui.this_connection_is_closed_messages_are_no_longer_available");
        }
        return link;
    }
    @Transactional
    public void end(String username, Long id) {
        Long actor=accounts.current(username).getId();
        Connection link=require(id,actor);
        guard.lock(link.getLowId(),link.getHighId());
        link.end();
    }
    @Transactional
    public void resetSkips(String username) { decisions.deleteByActorIdAndChoice(accounts.current(username).getId(),Decision.Choice.SKIP); }
    public List<Connection> forMember(Long actor) {
        return connections.findByLowIdOrHighIdOrderByCreatedAtDesc(actor,actor).stream()
                .filter(c -> c.isActive()&&!guard.blocked(c.getLowId(),c.getHighId())).toList();
    }
}
