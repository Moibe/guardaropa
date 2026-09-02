<script lang="ts">
  // Edición de una prenda ya existente, dentro de su propia tarjeta.
  //
  // Igual que SlotPicker: vive en su propio componente para que el estado del
  // ícono elegido se monte y se desmonte con la tarjeta, sin resetearlo a mano.
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { EMOJI_PRENDA } from '$lib/prendas';

  type Prenda = {
    id: number;
    nombre: string;
    icono: string | null;
    color: string | null;
    notas: string | null;
  };

  let { prenda }: { prenda: Prenda } = $props();

  // Capturar solo el valor inicial es justo lo que se quiere: el componente se
  // monta y se desmonta con la tarjeta, así que siempre nace con la prenda que
  // toca y de ahí el usuario lo edita libremente.
  // svelte-ignore state_referenced_locally
  let icono = $state(prenda.icono ?? '');

  function enfocar(node: HTMLInputElement) {
    node.focus();
    node.select();
  }
</script>

<form
  class="editor"
  method="POST"
  action="?/actualizar"
  use:enhance={() =>
    async ({ result, update }) => {
      await update({ reset: false });
      // Guardar cierra el editor; si falló la validación se queda abierto
      // con el mensaje de error.
      if (result.type === 'success') await goto('/guardarropa');
    }}
>
  <input type="hidden" name="id" value={prenda.id} />

  <label>
    <span>Nombre</span>
    <input class="campo" name="nombre" value={prenda.nombre} autocomplete="off" required use:enfocar />
  </label>

  <label>
    <span>Ícono</span>
    <input
      class="campo campo-icono"
      name="icono"
      bind:value={icono}
      placeholder="Pega un emoji"
      autocomplete="off"
    />
  </label>

  <div class="paleta">
    {#each EMOJI_PRENDA as emoji (emoji)}
      <button
        type="button"
        class="emoji"
        class:elegido={icono === emoji}
        onclick={() => (icono = icono === emoji ? '' : emoji)}
        aria-label="Usar {emoji} como ícono"
        aria-pressed={icono === emoji}
      >
        {emoji}
      </button>
    {/each}
  </div>

  <label>
    <span>Color</span>
    <input class="campo" name="color" value={prenda.color ?? ''} autocomplete="off" />
  </label>

  <label>
    <span>Notas</span>
    <textarea class="campo" name="notas" rows="2" value={prenda.notas ?? ''}></textarea>
  </label>

  <div class="pie">
    <button class="guardar" type="submit">Guardar</button>
    <a class="cancelar" href="/guardarropa">Cancelar</a>
  </div>
</form>

<style>
  .editor {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    width: 100%;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.22rem;
  }
  label span {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: rgba(24, 24, 27, 0.45);
  }

  .campo {
    width: 100%;
    box-sizing: border-box;
    padding: 0.35rem 0.5rem;
    font: inherit;
    font-size: 0.82rem;
    color: var(--ink);
    background: rgba(255, 255, 255, 0.85);
    border: 1px solid rgba(220, 38, 38, 0.25);
    border-radius: 8px;
  }
  .campo:focus {
    outline: none;
    border-color: rgba(220, 38, 38, 0.65);
    box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.15);
  }
  .campo-icono {
    width: 6rem;
    text-align: center;
    font-size: 1rem;
  }
  textarea.campo {
    resize: vertical;
  }

  .paleta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.2rem;
  }
  .emoji {
    width: 28px;
    height: 28px;
    padding: 0;
    font-size: 0.95rem;
    line-height: 1;
    background: rgba(255, 255, 255, 0.65);
    border: 1px solid rgba(220, 38, 38, 0.18);
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.14s ease, border-color 0.14s ease;
  }
  .emoji:hover {
    background: rgba(220, 38, 38, 0.14);
    border-color: rgba(220, 38, 38, 0.45);
  }
  .emoji.elegido {
    background: rgba(220, 38, 38, 0.2);
    border-color: rgba(220, 38, 38, 0.7);
  }

  .pie {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.15rem;
  }
  .guardar {
    padding: 0.32rem 0.9rem;
    font: inherit;
    font-size: 0.8rem;
    font-weight: 600;
    color: #fff;
    background: var(--red);
    border: 1px solid var(--red);
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.14s ease;
  }
  .guardar:hover {
    background: #b91c1c;
  }
  .cancelar {
    font-size: 0.78rem;
    color: rgba(24, 24, 27, 0.5);
    text-decoration: none;
  }
  .cancelar:hover {
    color: #b91c1c;
    text-decoration: underline;
  }
</style>
