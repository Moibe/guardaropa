<script lang="ts">
  // Edición de una prenda ya existente, dentro de su propia tarjeta.
  //
  // Igual que SlotPicker: vive en su propio componente para que el estado del
  // ícono elegido se monte y se desmonte con la tarjeta, sin resetearlo a mano.
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import IconoPrenda from '$lib/IconoPrenda.svelte';
  import { CLAVES_ICONO, COLORES_PRENDA, COLOR_ICONO_DEFAULT, ICONOS } from '$lib/iconos';

  type Prenda = {
    id: number;
    nombre: string;
    icono: string | null;
    iconoColor: string | null;
    color: string | null;
    notas: string | null;
  };

  let { prenda }: { prenda: Prenda } = $props();

  // Capturar solo el valor inicial es justo lo que se quiere: el componente se
  // monta y se desmonta con la tarjeta, así que siempre nace con la prenda que
  // toca y de ahí el usuario lo edita libremente.
  // svelte-ignore state_referenced_locally
  let icono = $state(prenda.icono ?? '');
  // svelte-ignore state_referenced_locally
  let iconoColor = $state(prenda.iconoColor ?? COLOR_ICONO_DEFAULT);

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

  <input type="hidden" name="icono" value={icono} />
  <input type="hidden" name="iconoColor" value={iconoColor} />

  <div class="bloque">
    <span class="rotulo">Ícono</span>
    <div class="paleta">
      {#each CLAVES_ICONO as clave (clave)}
        <button
          type="button"
          class="dibujo"
          class:elegido={icono === clave}
          onclick={() => (icono = icono === clave ? '' : clave)}
          aria-label="Usar {ICONOS[clave].nombre} como ícono"
          aria-pressed={icono === clave}
          title={ICONOS[clave].nombre}
        >
          <IconoPrenda {clave} color={iconoColor} tam={26} />
        </button>
      {/each}
    </div>
  </div>

  <!-- El color solo aplica al dibujo, así que no tiene caso ofrecerlo sin uno. -->
  {#if icono}
    <div class="bloque">
      <span class="rotulo">Color del ícono</span>
      <div class="paleta">
        {#each COLORES_PRENDA as c (c.hex)}
          <button
            type="button"
            class="muestra"
            class:elegido={iconoColor.toLowerCase() === c.hex}
            style="background: {c.hex}"
            onclick={() => (iconoColor = c.hex)}
            aria-label={c.nombre}
            aria-pressed={iconoColor.toLowerCase() === c.hex}
            title={c.nombre}
          ></button>
        {/each}
        <label class="otro" title="Otro color">
          <input type="color" bind:value={iconoColor} aria-label="Otro color" />
        </label>
      </div>
    </div>
  {/if}

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
  textarea.campo {
    resize: vertical;
  }

  .bloque {
    display: flex;
    flex-direction: column;
    gap: 0.28rem;
  }
  .rotulo {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: rgba(24, 24, 27, 0.45);
  }
  .paleta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .dibujo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    background: rgba(255, 255, 255, 0.75);
    border: 1px solid rgba(220, 38, 38, 0.18);
    border-radius: 9px;
    cursor: pointer;
    transition: background 0.14s ease, border-color 0.14s ease;
  }
  .dibujo:hover {
    border-color: rgba(220, 38, 38, 0.45);
  }
  .dibujo.elegido {
    background: rgba(220, 38, 38, 0.14);
    border-color: rgba(220, 38, 38, 0.7);
  }

  .muestra {
    width: 22px;
    height: 22px;
    padding: 0;
    border: 1px solid rgba(24, 24, 27, 0.22);
    border-radius: 999px;
    cursor: pointer;
    transition: transform 0.12s ease, box-shadow 0.12s ease;
  }
  .muestra:hover {
    transform: scale(1.12);
  }
  .muestra.elegido {
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.9), 0 0 0 4px var(--red);
  }
  .otro {
    display: inline-flex;
    width: 22px;
    height: 22px;
    border-radius: 999px;
    overflow: hidden;
    border: 1px dashed rgba(24, 24, 27, 0.35);
    cursor: pointer;
  }
  .otro input {
    width: 200%;
    height: 200%;
    margin: -50% 0 0 -50%;
    padding: 0;
    border: 0;
    background: none;
    cursor: pointer;
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
