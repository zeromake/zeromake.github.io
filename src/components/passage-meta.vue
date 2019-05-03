<template>
    <div class="passage-meta">
        <span>
            <i class="fa fa-calendar"/>{{ data.date | formatTime }}
        </span>
        <span v-if="!!data.type">
            |
            <router-link
                :to="'/categories/' + data.type"
            >
                <i class="fa fa-bookmark"/>
                {{data.type}}
            </router-link>
        </span>
    </div>
</template>

<script>
export default {
    props: {
        data: Object,
        default: () => {}
    },
}
</script>

<style lang="stylus" scoped>
.passage-meta
    font-size 16px
    color #616161
    i
        display inline-block
        margin-right 5px
</style>

