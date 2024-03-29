<script setup lang="ts">
  let refreshInterval: any
  const { data, refresh } = useFetch("/api/tasks")
  const searchValue = ref('')

  const displayTasks = computed(() => {
    if (!data.value) {
      return []
    }
    const sorted = [...data.value.tasks]
    sorted.sort((a, b) => {
      return taskSortNum(b.isComplete, b.numDeps) - taskSortNum(a.isComplete, a.numDeps)
    })
    const result: typeof sorted = []
    for (const i of sorted) {
      if (
        i.title.toLowerCase().includes(searchValue.value.toLowerCase()) ||
        i.description.toLowerCase().includes(searchValue.value.toLowerCase())
      ) {
        result.push(i)
      }
    }
    return result
  })

  const stats = computed(() => {
    const result = {
      complete: 0,
      ready: 0,
      notReady: 0,
      percent: 0,
    }
    
    if (!data.value) {
      return result
    }
    
    for (const i of data.value.tasks) {
      if (i.isComplete) {
        result.complete += 1
      } else if (i.numDeps <= 0) {
        result.ready += 1
      } else {
        result.notReady += 1
      }
    }
    result.percent = Math.floor(result.complete / data.value.tasks.length * 100)
    return result
  })

  onMounted(() => {
    refreshInterval = setInterval(refresh, 20000)
  })
  onUnmounted(() => {
    clearInterval(refreshInterval)
  })
</script>

<template>
  <main class=" w-full min-w-80 h-[calc(100vh-4rem)] sm:grid sm:grid-cols-[50%_50%] lg:grid-cols-[67%_33%] 2xl:grid-cols-[75%_25%]">
    <div class="w-full h-full">
      <div class=" h-10 p-1 grid grid-cols-[1fr_auto]">
        <h2 class="pl-2 leading-8 font-bold text-2xl text-black dark:text-white">
          Current Tasks
        </h2>
        <UButton 
          to="/task/new"
          label="Add Task"
          icon="i-heroicons-plus-16-solid"
          class="font-bold"
        />
        <!-- <NuxtLink
          to="/task/new"
          class=" px-2 rounded-md drop-shadow-md text-white dark:text-black font-bold leading-8 bg-teal-700 dark:bg-teal-300 hover:underline"
        >
          Add Task
        </NuxtLink> -->
      </div>
      <div class="p-1">
        <UInput 
          v-model="searchValue"
          autocomplete="off"
          variant="outline"
          icon="i-heroicons-magnifying-glass-16-solid"
          placeholder="Search for a task..."
        />
        <!-- <input
          v-model="searchValue"
          type="text"
          autocomplete="off"
          placeholder="Search for a task..."
          class=" w-full px-2 py-1 rounded-md drop-shadow-md bg-teal-200 dark:bg-teal-800 hover:bg-teal-300 hover:dark:bg-teal-700 focus:bg-teal-300 focus:dark:bg-teal-700 text-black dark:text-white"
        > -->
      </div>
      <ul
        v-if="data && data.tasks.length > 0" 
        class="lg:grid lg:grid-cols-2 2xl:grid-cols-3 p-2 lg:p-4 lg:gap-4 max-h-[calc(100vh-8rem)] overflow-y-auto list-none m-0"
      >
        <li 
          v-for="item of displayTasks" 
          :key="item.id"
          class="max-lg:pb-2 m-0"
        >
          <TaskListItem
            :task-id="item.id"
            :title="item.title"
            :description="item.description"
            :is-complete="item.isComplete"
            :num-deps="item.numDeps"
          />
        </li>
      </ul>
      <div
        v-else
        class=" pt-8"
      >
        <h3 class=" font-bold text-3xl text-center text-black dark:text-white">
          No tasks!
        </h3>
        <p class="text-center text-black dark:text-white">
          Click "Add Task" above to create a task.
        </p>
      </div>
    </div>
    <div class="hidden sm:block w-full h-full overflow-y-auto p-1 lg:p-2 pt-8">
      <div class="p-1 lg:p-2">
        <div v-if="stats.percent < 100">
          <p
            class=" text-center text-3xl text-black dark:text-white font-bold"
          >
            We're <span class="text-blue-500 dark:text-blue-400">{{ stats.percent }}%</span> of the way there!
          </p>
        </div>
        <div v-else>
          <p class=" text-center text-3xl text-green-500 dark:text-green-400 font-bold">
            We've made it. 
          </p>
          <p class=" text-center text-3xl text-green-500 dark:text-green-400 font-bold">
            Great work, team!
          </p>
        </div>
      </div>
      <StatsChart
        :complete="stats.complete"
        :ready="stats.ready"
        :not-ready="stats.notReady"
      />
    </div>
  </main>
</template>