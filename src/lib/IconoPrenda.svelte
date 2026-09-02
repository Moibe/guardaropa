<script lang="ts">
  // Pinta uno de los íconos dibujados de src/lib/iconos.ts en el color asignado.
  import { COLOR_ICONO_DEFAULT, ICONOS, esClaveIcono } from '$lib/iconos';

  let {
    clave,
    color = null,
    tam = 20
  }: {
    clave: string | null;
    color?: string | null;
    tam?: number;
  } = $props();

  const dibujo = $derived(clave && esClaveIcono(clave) ? ICONOS[clave] : null);
</script>

{#if dibujo}
  <svg
    width={tam}
    height={tam}
    viewBox="0 0 32 32"
    style="color: {color ?? COLOR_ICONO_DEFAULT}"
    role="img"
    aria-label={dibujo.nombre}
  >
    {#each dibujo.relleno as d (d)}
      <path class="relleno" {d} />
    {/each}
    {#each dibujo.trazo as d (d)}
      <path class="trazo" {d} />
    {/each}
  </svg>
{/if}

<style>
  svg {
    display: block;
    flex-shrink: 0;

    /* El trazo es el mismo color, oscurecido: así los detalles se ven igual
       sobre un blanco que sobre un azul marino. El primer valor es el respaldo
       para donde no haya color-mix. */
    --trazo: rgba(24, 24, 27, 0.45);
    --trazo: color-mix(in oklab, currentColor 45%, #18181b);
  }
  .relleno {
    fill: currentColor;
    stroke: var(--trazo);
    stroke-width: 1;
    stroke-linejoin: round;
  }
  .trazo {
    fill: none;
    stroke: var(--trazo);
    stroke-width: 1.2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
</style>
