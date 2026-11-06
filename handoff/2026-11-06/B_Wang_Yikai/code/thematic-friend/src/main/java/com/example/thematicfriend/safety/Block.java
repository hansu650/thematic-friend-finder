package com.example.thematicfriend.safety;
import jakarta.persistence.*;
@Entity
@Table(name="member_blocks",uniqueConstraints=@UniqueConstraint(columnNames={"actor_id","target_id"}))
public class Block {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(name="actor_id",nullable=false) private Long actorId;
    @Column(name="target_id",nullable=false) private Long targetId;
    protected Block() { }
    public Block(Long actor, Long target) { actorId=actor; targetId=target; }
    public Long getTargetId() { return targetId; }
}
