package com.example.thematicfriend.connection;

import jakarta.persistence.*;

@Entity
@Table(name="decisions", uniqueConstraints=@UniqueConstraint(columnNames={"actor_id", "target_id"}))
public class Decision {
    public enum Choice { LIKE, SKIP }
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(name="actor_id", nullable=false) private Long actorId;
    @Column(name="target_id", nullable=false) private Long targetId;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private Choice choice;
    protected Decision() { }
    public Decision(Long actor, Long target, Choice choice) { actorId=actor; targetId=target; this.choice=choice; }
    public Long getActorId() { return actorId; }
    public Long getTargetId() { return targetId; }
    public Choice getChoice() { return choice; }
    public void setChoice(Choice value) { choice=value; }
}
