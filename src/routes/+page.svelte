<!-- Home en blanco. El "chrome" (navbar/sidebar + gradiente) vive en el layout. -->

<!-- Sin este título el browser cae a la URL y el tab dice "localhost:3300".
     El título va por página, no en el layout: dos <title> (uno del layout y otro
     de la página) se pisarían, y en SSR el browser se queda con el primero. -->
<svelte:head><title>Guardaropa</title></svelte:head>
