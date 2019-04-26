<script>
export default {
    data() {
        return {
            content(createElement) {
                return null;
            },
            defaultContent(createElement) {
                return null;
            },
            callback: [],
            open: false,
        };
    },
    render(createElement) {
        return createElement("div", {
            class: ["layer", this.open ? "" : "layer-hide"],
            on: {
                click: this.hide,
            }
        }, this.content.call(this, createElement));
    },
    methods: {
        show(render, callback) {
            if(render) {
                this.content = render;
            }
            if(callback) {
                this.callback.push(callback);
            }
            this.open = true;
        },
        hide() {
            this.open = false;
            const callback = this.callback;
            this.callback = [];
            for(const c of callback) {
                c();
            }
            this.content = this.defaultContent;
        }
    }
}
</script>

<style lang="stylus" scoped>
.layer
    display block
    z-index 600
    position fixed
    left 0
    right 0
    top 0
    bottom 0
    background-color rgba(0, 0, 0, 0.8)
.layer-hide
    display none
</style>
