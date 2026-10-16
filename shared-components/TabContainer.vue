<template lang="html">
    <div class="tab-container">
        <hr>
        <!-- Tab Navigation -->
        <ul
            class="nav nav-tabs mb-3"
            role="tablist"
        >
            <li
                v-for="tab in tabs"
                :key="tab.id"
                class="nav-item"
                role="presentation"
            >
                <button
                    class="nav-link"
                    :class="{ active: activeTab === tab.id }"
                    type="button"
                    role="tab"
                    @click="activeTab = tab.id"
                >
                    {{ $t(tab.label) }}
                </button>
            </li>
        </ul>

        <!-- Tab Content -->
        <div
            v-for="tab in tabs"
            v-show="activeTab === tab.id"
            :key="tab.id"
            role="tabpanel"
        >
            <slot :name="tab.id" />
        </div>
    </div>
</template>

<script>
export default {
    name: "TabContainer",
    props: {
        tabs: {
            type: Array,
            required: true,
            validator (tabs) {
                return tabs.every(tab => tab.id && tab.label);
            }
        },
        initialTab: {
            type: String,
            required: false,
            default: null
        }
    },
    data () {
        return {
            activeTab: null
        };
    },
    watch: {
        tabs: {
            immediate: true,
            handler () {
                if (!this.activeTab && this.tabs.length > 0) {
                    this.activeTab = this.initialTab || this.tabs[0].id;
                }
            }
        }
    },
    mounted () {
        if (!this.activeTab && this.tabs.length > 0) {
            this.activeTab = this.initialTab || this.tabs[0].id;
        }
    }
};
</script>

<style scoped>
.tab-container {
    width: 100%;
}
</style>
