package com.example.thematicfriend.config;

import com.example.thematicfriend.account.Member;
import org.springframework.stereotype.Component;

/** Stock portraits for fictional demonstration accounts, never uploaded identities. */
@Component("referencePhotos")
public class ReferencePhotos {
    public String css(Member member) {
        return switch (member.getUsername()) {
            case "demo_zhou" -> "demo-photo-01";
            case "demo_lin" -> "demo-photo-02";
            case "demo_xu" -> "demo-photo-03";
            case "demo_chen" -> "demo-photo-04";
            case "demo_he" -> "demo-photo-05";
            case "demo_su" -> "demo-photo-06";
            case "demo_aria" -> "demo-photo-07";
            case "demo_theo" -> "demo-photo-08";
            case "demo_maya" -> "demo-photo-09";
            case "demo_leo" -> "demo-photo-10";
            case "demo_iris" -> "demo-photo-11";
            case "demo_luca" -> "demo-photo-12";
            case "demo_nora" -> "demo-photo-13";
            case "demo_eli" -> "demo-photo-14";
            case "demo_sora" -> "demo-photo-15";
            case "demo_milo" -> "demo-photo-16";
            case "demo_hazel" -> "demo-photo-17";
            case "demo_finn" -> "demo-photo-18";
            case "demo_mia" -> "demo-photo-19";
            case "demo_jules" -> "demo-photo-20";
            case "demo_avery" -> "demo-photo-21";
            case "demo_rowan" -> "demo-photo-22";
            case "demo_jade" -> "demo-photo-23";
            case "demo_noel" -> "demo-photo-24";
            case "demo_lena" -> "demo-photo-25";
            case "demo_kai" -> "demo-photo-26";
            case "demo_riley" -> "demo-photo-27";
            case "demo_parker" -> "demo-photo-28";
            default -> "";
        };
    }
}
