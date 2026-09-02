<script lang="ts">
  import { enhance } from '$app/forms';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Textarea } from '$lib/components/ui/textarea';
  import { ETIQUETA_POSICION, ICONO_POSICION, POSICIONES } from '$lib/prendas';
  import type { ActionData, PageData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  const porPosicion = $derived.by(() => {
    const mapa = new Map<string, PageData['catalogo']>();
    for (const prenda of data.catalogo) {
      const lista = mapa.get(prenda.posicion);
      if (lista) lista.push(prenda);
      else mapa.set(prenda.posicion, [prenda]);
    }
    return mapa;
  });

  const activas = $derived(data.catalogo.filter((p) => p.activa).length);
</script>

<svelte:head><title>Guardarropa · Guardaropa</title></svelte:head>

<section class="guardarropa">
  <div class="catalogo">
    <header class="cabeza">
      <h1>Guardarropa</h1>
      <p>{activas} {activas === 1 ? 'prenda activa' : 'prendas activas'} de {data.catalogo.length}</p>
    </header>

    {#if data.catalogo.length === 0}
      <p class="vacio">
        Todavía no hay prendas. Da de alta la primera aquí a la derecha y luego podrás
        armar vestuarios en el calendario.
      </p>
    {/if}

    {#each POSICIONES as posicion (posicion)}
      {@const lista = porPosicion.get(posicion) ?? []}
      {#if lista.length}
        <div class="grupo">
          <h2>
            <span class="ico" aria-hidden="true">{ICONO_POSICION[posicion]}</span>
            {ETIQUETA_POSICION[posicion]}
            <span class="cuenta">{lista.length}</span>
          </h2>
          <ul>
            {#each lista as prenda (prenda.id)}
              {@const usos = data.usos[prenda.id] ?? 0}
              <li class:archivada={!prenda.activa}>
                <div class="texto">
                  <p class="nombre">
                    {prenda.nombre}
                    {#if prenda.color}<span class="color">{prenda.color}</span>{/if}
                    {#if !prenda.activa}<span class="tag">archivada</span>{/if}
                  </p>
                  {#if prenda.notas}<p class="notas">{prenda.notas}</p>{/if}
                  <p class="usos">
                    {usos === 0 ? 'sin usar' : `usada ${usos} ${usos === 1 ? 'vez' : 'veces'}`}
                  </p>
                </div>
                <div class="acciones">
                  <form method="POST" action="?/alternarArchivo" use:enhance>
                    <input type="hidden" name="id" value={prenda.id} />
                    <button class="chico" type="submit">
                      {prenda.activa ? 'Archivar' : 'Restaurar'}
                    </button>
                  </form>
                  {#if usos === 0}
                    <form method="POST" action="?/eliminar" use:enhance>
                      <input type="hidden" name="id" value={prenda.id} />
                      <button class="chico borrar" type="submit" aria-label="Eliminar {prenda.nombre}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                      </button>
                    </form>
                  {/if}
                </div>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    {/each}
  </div>

  <aside class="alta">
    <h2>Nueva prenda</h2>
    <form method="POST" action="?/agregar" use:enhance>
      <label>
        <span>Posición</span>
        <select name="posicion" required>
          {#each POSICIONES as posicion (posicion)}
            <option value={posicion}>{ICONO_POSICION[posicion]} {ETIQUETA_POSICION[posicion]}</option>
          {/each}
        </select>
      </label>
      <label>
        <span>Nombre</span>
        <Input name="nombre" placeholder="Playera polo roja" autocomplete="off" required />
      </label>
      <label>
        <span>Color</span>
        <Input name="color" placeholder="Rojo (opcional)" autocomplete="off" />
      </label>
      <label>
        <span>Notas</span>
        <Textarea name="notas" placeholder="Opcional" rows={3} />
      </label>
      {#if form && 'error' in form}
        <p class="error">{form.error}</p>
      {/if}
      <Button type="submit">Agregar al guardarropa</Button>
    </form>
  </aside>
</section>

<style>
  .guardarropa {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 300px;
    gap: 1.25rem;
    align-items: start;
    padding: 0.75rem 0.25rem 1.5rem;
  }

  .cabeza {
    margin-bottom: 1.25rem;
  }
  .cabeza h1 {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 600;
    color: var(--ink);
  }
  .cabeza p {
    margin: 0.2rem 0 0;
    font-size: 0.82rem;
    color: rgba(24, 24, 27, 0.5);
  }

  .vacio {
    max-width: 46ch;
    margin: 0;
    font-size: 0.88rem;
    line-height: 1.5;
    color: var(--ink-soft);
  }

  .grupo {
    margin-bottom: 1.5rem;
  }
  .grupo h2 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 0.5rem;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: rgba(24, 24, 27, 0.45);
  }
  .ico {
    font-size: 0.95rem;
    letter-spacing: 0;
  }
  .cuenta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    font-size: 0.7rem;
    letter-spacing: 0;
    color: #b91c1c;
    background: rgba(220, 38, 38, 0.12);
    border-radius: 999px;
  }

  .grupo ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 0.5rem;
  }
  .grupo li {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.65rem 0.75rem;
    background: rgba(255, 255, 255, 0.5);
    border: 1px solid rgba(220, 38, 38, 0.16);
    border-radius: 11px;
  }
  .grupo li.archivada {
    opacity: 0.55;
  }

  .texto {
    flex: 1;
    min-width: 0;
  }
  .nombre {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin: 0;
    font-size: 0.88rem;
    color: var(--ink);
    overflow-wrap: anywhere;
  }
  .color,
  .tag {
    font-size: 0.68rem;
    padding: 0.1rem 0.4rem;
    border-radius: 999px;
    background: rgba(220, 38, 38, 0.1);
    color: #b91c1c;
  }
  .tag {
    background: rgba(24, 24, 27, 0.08);
    color: rgba(24, 24, 27, 0.55);
  }
  .notas {
    margin: 0.25rem 0 0;
    font-size: 0.78rem;
    color: var(--ink-soft);
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  .usos {
    margin: 0.25rem 0 0;
    font-size: 0.72rem;
    color: rgba(24, 24, 27, 0.42);
  }

  .acciones {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    flex-shrink: 0;
  }
  .chico {
    padding: 0.22rem 0.5rem;
    font: inherit;
    font-size: 0.72rem;
    color: rgba(24, 24, 27, 0.6);
    background: rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(220, 38, 38, 0.2);
    border-radius: 7px;
    cursor: pointer;
    transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease;
  }
  .chico:hover {
    background: rgba(220, 38, 38, 0.12);
    border-color: rgba(220, 38, 38, 0.45);
    color: #b91c1c;
  }
  .borrar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    align-self: flex-end;
    padding: 0.25rem;
  }

  /* ---- Alta ---- */

  .alta {
    background: rgba(255, 255, 255, 0.5);
    border: 1px solid var(--glass-border);
    border-radius: 14px;
    padding: 1rem;
  }
  .alta h2 {
    margin: 0 0 0.9rem;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--ink);
  }
  .alta form {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }
  .alta label {
    display: flex;
    flex-direction: column;
    gap: 0.28rem;
  }
  .alta label span {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: rgba(24, 24, 27, 0.45);
  }
  .alta select {
    height: 36px;
    padding: 0 0.6rem;
    font: inherit;
    font-size: 0.875rem;
    color: var(--ink);
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(220, 38, 38, 0.25);
    border-radius: 8px;
  }
  .error {
    margin: 0;
    font-size: 0.8rem;
    color: #b91c1c;
  }

  @media (max-width: 860px) {
    .guardarropa {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
