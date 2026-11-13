package com.example.thematicfriend.chat;

import org.springframework.stereotype.Component;
import java.util.List;

@Component("stickers")
public class StickerCatalog {
    public record Sticker(String id,String emoji,String en,String zh) { }
    private static final List<Sticker> ALL=List.of(
        new Sticker("hello","👋","Hello there!","嗨，很高兴认识你"),
        new Sticker("happy","😄","You made my day","今天也要开心"),
        new Sticker("heart","🫶","A little love","给你比个心"),
        new Sticker("coffee","☕","Coffee time?","一起喝咖啡吗"),
        new Sticker("cheer","👏","You got this!","给你鼓鼓掌"),
        new Sticker("night","🌙","Sweet dreams","晚安，好梦")
    );
    public List<Sticker> all() { return ALL; }
    public Sticker find(String body) {
        if (body==null) return null;
        return ALL.stream().filter(s -> body.equals("[[sticker:"+s.id()+"]]")).findFirst().orElse(null);
    }
    public String preview(String body, String language) {
        Sticker sticker=find(body);
        return sticker==null?body:sticker.emoji()+" "+("zh".equals(language)?sticker.zh():sticker.en());
    }
}
