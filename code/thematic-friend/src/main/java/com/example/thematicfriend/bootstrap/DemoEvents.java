package com.example.thematicfriend.bootstrap;

import com.example.thematicfriend.account.MemberRepository;
import com.example.thematicfriend.events.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Component @Profile("demo") @Order(30)
public class DemoEvents implements CommandLineRunner {
    private final EventRepository events;private final MemberRepository members;
    public DemoEvents(EventRepository events,MemberRepository members){this.events=events;this.members=members;}
    @Override @Transactional public void run(String... args){
        var host=members.findByUsername("demo_zhou");if(host.isEmpty())return;
        LocalDateTime start=LocalDateTime.now().plusDays(2).withHour(16).withMinute(15).withSecond(0).withNano(0);
        String[][] fixtures={
            {"Fall's Journey - Leaves, Sunset and a Weekend Walk","Walk through the neighbourhood, take a few photographs before sunset and finish at a cafe.\n\nMeet at 16:15. Wear comfortable shoes and leave whenever suits you.","Hiking","Corner Cafe","city-walk.jpg"},
            {"Coffee & Conversations - A Weekend Catch-up","Bring a book you are reading or something you would like to talk about. Start with a coffee and get to know the people around the table.","Coffee","Riverside Cafe","coffee-chat.jpg"},
            {"A Little Photography Walk","Notice the light and details around the neighbourhood. A phone or camera is welcome; no photography experience is needed.","Photography","City Park South Gate","photo-walk.jpg"},
            {"Book Club - Share a Favourite Book","Bring a book you enjoy and a passage that stayed with you. There is no assigned reading; you can also come just to listen.","Reading","Neighbourhood Bookshop","book-club.jpg"},
            {"Friday Music - Share Your Playlist","Start with a song you keep playing and share the story behind it.","Music","Riverside Cafe","live-music.jpg"},
            {"A Gallery Visit and a Conversation","Start with a piece that catches your eye, then explore and talk at an easy pace. Make your own plans afterwards.","Art","City Art Centre Entrance","gallery.jpg"},
            {"Pour-over Afternoon - Start with a Coffee","Try a few different coffee flavours together. Bring your own beans or simply bring your curiosity.","Coffee","Corner Cafe","coffee-table.jpg"},
            {"A Gentle Walk in the Woods","Take an easy trail and make time to talk. Bring water and comfortable shoes; we will follow a pace that suits the group.","Hiking","Forest Park Visitor Centre","trail.jpg"},
            {"The Weekend Table - A Meal Together","Recommend a favourite dish and share a story around one table. Everyone pays for their own food.","Food","Neighbourhood Restaurant","food-table.jpg"},
            {"Riverside Run - Chat Afterwards","Enjoy an easy run without chasing a pace. Walking breaks are welcome, with a stretch together at the end.","Sport","Riverfront Trail Entrance","running.jpg"},
            {"Board Game Night - New Friends Welcome","Start with a simple cooperative game and learn the rules together. Come on your own or bring a friend.","Gaming","Board Game House","board-games.jpg"},
            {"After the Film - Keep the Conversation Going","Talk about a film you recently enjoyed and swap ideas for the next watchlist. Listening is welcome too.","Films","Cinema Cafe","film-night.jpg"},
            {"Where Next - Swap Travel Plans","Bring a travel photograph and the small story behind it. Find inspiration for the next short trip.","Travel","Riverside Cafe","travel.jpg"},
            {"Vinyl Afternoon - Play Something You Love","Bring a record or a favourite song and talk about the first time you heard it. Leave an afternoon to listen.","Music","Neighbourhood Record Shop","vinyl.jpg"},
            {"Weekend Market - Discover Something Local","Browse produce, flowers and handmade stalls together. Stop wherever catches your eye and find somewhere to sit afterwards.","Food","Weekend Market Entrance","weekend-market.jpg"},
            {"A Park Afternoon with New Friends","Bring a picnic blanket and a favourite snack for a relaxed conversation in the shade. Help leave the space tidy afterwards.","Food","City Park Lawn","picnic.jpg"},
            {"Pottery for Beginners - Make Your Own Cup","Start with a small piece of clay and make a cup that does not have to be perfect. Suitable for beginners; material costs are paid individually.","Art","Neighbourhood Pottery Studio","ceramics.jpg"},
            {"Blue Hour - Photograph the City at Night","Walk from sunset into the evening lights with a phone or camera. Share one favourite photograph before heading home.","Photography","Riverfront Viewpoint","night-photo.jpg"}
        };
        // Legacy titles identify existing local fixtures without changing their records.
        String[] legacyTitles={
            "Fall’s Journey — 落叶、日落与周末漫步",
            "Coffee & Conversations · 周末聊一会儿",
            "一场小小的摄影散步",
            "Book Club · 交换你喜欢的一本书",
            "Friday Music · 分享你的歌单",
            "一起看展，慢慢聊",
            "手冲下午茶 · 从一杯咖啡开始",
            "林间慢行 · 给周末透透气",
            "周末长桌 · 一起吃顿饭",
            "江边慢跑 · 跑完再聊",
            "桌游之夜 · 新朋友也能马上开局",
            "电影散场后 · 留一点时间聊天",
            "下一站去哪 · 交换旅行计划",
            "黑胶午后 · 把喜欢的歌放出来",
            "周末逛市集 · 发现街角的小店",
            "公园小聚 · 把午后留给朋友",
            "陶艺初体验 · 捏一个自己的杯子",
            "蓝调时刻 · 一起拍城市的夜"
        };
        for(int i=0;i<fixtures.length;i++){
            var f=fixtures[i];
            // Add missing fixtures without replacing dates, RSVPs, saves or user-created events.
            if(events.existsByHostIdAndTitle(host.get().getId(),f[0])
                    || events.existsByHostIdAndTitle(host.get().getId(),legacyTitles[i]))continue;
            events.save(new CommunityEvent(f[0],f[1],f[2],f[3],"Wuhan",start.plusDays(i),12,host.get().getId(),f[4]));
        }
    }
}
