<script lang="ts">
  // Buscador de una posición del vestuario: escribes, filtra abajo, y si lo que
  // escribiste no existe, Enter la da de alta y te la pone.
  //
  // Vive en su propio componente a propósito: el renglón abierto se monta y se
  // desmonta al navegar, así que el texto escrito se limpia solo al cambiar de
  // renglón, sin tener que resetearlo a mano.
  import { enhance } from '$app/forms';
  import IconoPrenda from '$lib/IconoPrenda.svelte';
  import { normaliza } from '$lib/prendas';

  type Opcion = { id: number; nombre: string; icono: string | null; iconoColor: string | null };

  let {
    vestuarioId,
    posicion,
    etiqueta,
    opciones,
    hayEnPosicion,
    accionPoner,
    accionAgregar
  }: {
    vestuarioId: number;
    posicion: string;
    etiqueta: string;
    opciones: Opcion[];
    hayEnPosicion: boolean;
    accionPoner: string;
    accionAgregar: string;
  } = $props();

  let busqueda = $state('');

  const termino = $derived(normaliza(busqueda));
  const filtradas = $derived(
    termino ? opciones.filter((p) => normaliza(p.nombre).includes(termino)) : opciones
  );
  const exacta = $derived(opciones.find((p) => normaliza(p.nombre) === termino));

  function enfocar(node: HTMLInputElement) {
    node.focus();
  }
</script>

<form method="POST" action={accionPoner} use:enhance>
  <input type="hidden" name="vestuarioId" value={vestuarioId} />
  <input type="hidden" name="posicion" value={posicion} />
  <input
    class="buscar"
    name="nombre"
    bind:value={busqueda}
    placeholder="Escribe {etiqueta.toLowerCase()}…"
    autocomplete="off"
    required
    use:enfocar
  />
</form>

{#if filtradas.length}
  <div class="opciones">
    {#each filtradas as prenda (prenda.id)}
      <form method="POST" action={accionAgregar} use:enhance>
        <input type="hidden" name="vestuarioId" value={vestuarioId} />
        <input type="hidden" name="prendaId" value={prenda.id} />
        <button class="opcion" type="submit">
          {#if prenda.icono}
            <IconoPrenda clave={prenda.icono} color={prenda.iconoColor} tam={15} />
          {/if}
          {prenda.nombre}
        </button>
      </form>
    {/each}
  </div>
{/if}

{#if termino && !exacta}
  <p class="pista">
    Enter para dar de alta <strong>{busqueda.trim()}</strong> y ponértela.
  </p>
{:else if !termino && !opciones.length}
  <p class="pista">
    {hayEnPosicion
      ? 'Ya traes puesto todo lo que tienes para esta posición. Escribe para dar de alta otra.'
      : 'No tienes prendas para esta posición. Escribe el nombre para darla de alta.'}
  </p>
{/if}

<style>
  .buscar {
    width: 100%;
    box-sizing: border-box;
    height: 30px;
    padding: 0 0.6rem;
    margin-bottom: 0.4rem;
    font: inherit;
    font-size: 0.8rem;
    color: var(--ink);
    background: rgba(255, 255, 255, 0.85);
    border: 1px solid rgba(220, 38, 38, 0.3);
    border-radius: 8px;
  }
  .buscar:focus {
    outline: none;
    border-color: rgba(220, 38, 38, 0.65);
    box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.15);
  }

  .opciones {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
  }
  .opcion {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.22rem 0.65rem;
    font: inherit;
    font-size: 0.78rem;
    color: #b91c1c;
    background: rgba(255, 255, 255, 0.75);
    border: 1px solid rgba(220, 38, 38, 0.3);
    border-radius: 999px;
    cursor: pointer;
    transition: background 0.16s ease, border-color 0.16s ease;
  }
  .opcion:hover {
    background: rgba(220, 38, 38, 0.16);
    border-color: rgba(220, 38, 38, 0.55);
  }

  .pista {
    margin: 0.35rem 0 0;
    font-size: 0.75rem;
    line-height: 1.4;
    color: rgba(24, 24, 27, 0.5);
  }
  .pista strong {
    font-weight: 600;
    color: #b91c1c;
  }
</style>
