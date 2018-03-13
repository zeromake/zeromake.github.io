<template>
    <li class="news-item">
        <h3 class="title">
            <router-link :to="'/pages/' + item.filename">{{ item.title }}</router-link>
        </h3>
        <br>
        <span class="meta">
            <span class="post-meta time">
                <i class="fa fa-clock-o"></i>
                <time class="post-date">  {{ item.date | timeAgo }}前</time>
                <time class="post-date">({{ item.date | formatTime }})</time>
            </span>
            <span class="post-meta post-meta-tags">
                <i class="fa fa-tag" v-once></i>
                <span class="meta-tag" v-for="meta_tag in item.tags" :key="meta_tag">{{ meta_tag }}</span>
            </span>
        </span>
    </li>
</template>

<script>
export default {
    name: 'news-item',
    props: ['item']
}
</script>

<style lang="stylus">
.news-item
    background-color #fff
    padding 20px 30px 20px 80px
    border 1px solid #eee
    position relative
    line-height 20px
    .score
        color #f60
        font-size 1.1em
        font-weight 700
        position absolute
        top 50%
        left 0
        width 80px
        text-align center
        margin-top -10px
    .title
        font-size 30px
        a
            line-height 30px
            color: #2C3F51;
            text-decoration: none !important;
            transition: color 0.3s ease;
            &:hover
                color: #23527c;
@media (max-width 700px)
    .news-item
        padding 15px 20px 15px 20px
        .title
            font-size 25px
            a
                line-height 25px

@media (max-width 600px)
    .news-item
        padding 5px 10px 5px 10px
        .title
            font-size 18px
            a
                line-height 18px
</style>
