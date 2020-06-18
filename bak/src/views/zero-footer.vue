<template>
<div class="footer-wrapper">
    <footer class="footer">
        <div class="footer-col" v-for="f in footer" :key="f.title">
            <h5 class="footer-title">{{ f.title }}</h5>
            <span class="footer-item" v-for="item in f.info" :key="item.title">
                <a :href="item.href" target="_blank" rel="noopener noreferrer">
                    {{ item.title }}
                </a>
            </span>
        </div>
        <div class="footer-info" v-for="info in infos" v-html="info.html ? info.html : ''" :key="info.key">
            <i :class="`fa fa-${info.icon}`"/>
            {{
                info.text
            }}
        </div>
    </footer>
</div>
</template>

<script>
export default {
    data() {
        return {
            footer: [
                {
                    title: '实验室',
                    info: [
                        {
                            title: 'docker-debug',
                            href: 'https://github.com/zeromake/docker-debug',
                        },
                        {
                            title: 'zreact',
                            href: 'https://github.com/zeromake/zreact',
                        },
                        {
                            title: 'library',
                            href: 'https://github.com/zeromake/library',
                        },
                    ]
                },
                {
                    title: '技术社交',
                    info: [
                        {
                            title: 'Github',
                            href: 'https://github.com/zeromake',
                        },
                        {
                            title: 'QQ',
                            href: 'https://wpa.qq.com/msgrd?v=3&uin=390720046&site=https%3A%2F%2Fblog.zeromake.com&menu=yes'
                        },
                        {
                            title: 'telegram',
                            href: 'https://telegram.me/zeromake'
                        }
                    ]
                },
                {
                    title: '博客推荐',
                    info: [
                        {
                            title: '面向信仰编程',
                            href: 'https://draveness.me',
                        },
                        {
                            title: 'Aylei\'s Blog',
                            href: 'https://aleiwu.com/post/',
                        },
                        {
                            title: 'No Headback',
                            href: 'http://xargin.com',
                        }
                    ]
                }
            ],
            infos: [
                {
                    key: 1,
                    icon: 'at',
                    text: '联系方式：a390720046@gmail.com'
                },
                {
                    key: 2,
                    html: `<i class="fa fa-copyright"></i>
                    2019 Created by <a href="https://blog.zeromake.com/" target="_blank">zeromake</a>.
                    Theme copy <a href="https://github.com/dongyuanxin/theme-ad/" target="_blank">Theme-AD</a>.
                    All rights reserved.`
                }
            ]
        }
    }
}
</script>
