<script lang="ts">
	export let title: string;
	export let description: string;
	export let image: string;
	export let link: string;
</script>

<div class="flex justify-center">
	<div
		class="rounded-3xl border border-white/10 bg-white/[.01] backdrop-blur-md transition-all duration-300 ease-in-out hover:scale-105 hover:rotate-1"
	>
		<a href={link}>
			<img
				loading="lazy"
				class="rounded-t-3xl"
				src="https://directus.simonesalerno.it/assets/{image}/{title}.jpg"
				alt={title}
			/>
		</a>
		<div class="px-6 py-5">
			<a href={link}>
				<h5 class="mb-2 text-2xl font-medium text-gray-100">
					{title}
				</h5>
			</a>

			<p class="mb-3 text-base text-gray-300 lg:text-xl">
				{description}
			</p>
		</div>
	</div>
</div>
