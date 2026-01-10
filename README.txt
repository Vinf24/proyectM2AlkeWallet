Aparentemente el programa ya funciona.
objetivos:
- (COMPLETO) hacer que index.html sea donde se ofrezca "registrarse" o "iniciar sesión".
- (COMPLETO) traspasar el contenido de index.html a un "login.html".
- (COMPLETO) en index.html, nueva funcionalidad, formulario registro, que solicite: Nombre, Apellido, Email, contraseña, Alias. 
- (COMPLETO) Email y contraseña registrados previamente serán los considerados en login.html.
- (COMPLETO) variables con nombres más claros y revisar código muerto.

URGENTE:
- (COMPLETO) preparar login.html para comportarse como página principal
- (COMPLETO) diferenciar contactos, saldo e historial por usuario
- (COMPLETO) al agregar contacto, detectar cuenta y nombre de banco, coincidente entre usuarios registrados, para cargar nombre, apellido y solo preguntar por el alias.
- (COMPLETO) reestructurar la apariencia, nuevo diseño y paleta de colores.
    - (COMPLETO) corregir apariencia y tamaño de TODAS las alertas
    - (COMPLETO) reemplazar historytable, por una lista, cada item será un contenedor más flexible.

Objetivos menos prioritarios:

- (COMPLETO) intentar colocar un gráfico de saldo dentro de menu.html.
- (COMPLETO) límite de transacciones visibles en el historial, dentro de transactions.html
- (COMPLETO) opción "limpiar historial"
- (COMPLETO) botón eliminar contacto, que tome el contacto seleccionado de la lista, básicamente, al desplegar la opcón "Enviar" en sendmoney.html, que también se ofrezca eliminarlo.

Nuevos Objetivos:

- lista contactos corregir tamaño
- alertas con animación

REVISION:

- planificar la revisión de las funcionalidades, para detectar posibles errores.
    - Index: Tratar de crear usuario, verificar alertas, no correo, formato correo, contraseña, etc.
        Verificar como se ve en diferentes tamaños de pantalla, tambien con el formulario.
        Ingresar con el usuario recien creado.
        (correo@prueba.com / prueba1234) 
        Alias: Pedro
        Nombre: Primera
        Apellido: Prueba

--- COMPLETADO ---

    - Menú: Ver que indica bien el saldo, gráfico funcional.
        copiar la cuenta Alke generada, guardar aqui (69222373), para añadirlo de contacto.
        botones para ir a depositar, enviar dinero y ver ultimos movimientos, desplegando leyendas personalizadas.
        Verificar como se ve en diferentes tamaños de pantalla.
        Recordando que la cuenta Alke está copiada, probar el logout, crear otro usuario 
            (correo@contacto.com / alke1234) 
            Alias: Diego
            Nombre: Segundo
            Apellido: Ensayo
            
             - entrar con el nuevo usuario.
        copiar cuenta Alke ingresar aqui (90941907).

--- COMPLETADO ---

    - Deposit: Hacer un depósito, de 25.000, verificar alerta indicando el monto y reenviando al menú.
        Verificar como se ve en diferentes tamaños de pantalla.
    - Send: Agregar contacto, verificar cada alerta para cada elemento del formulario.
            (correo@comun.com / comun1234)
            Alias: Juan
            Nombre: Tercer
            Apellido: Estudio
            Nombre Banco: otro
            Numero Cuenta: cualquiera de 8 dígitos

        agregar otro contacto con el numero de cuenta del usuario Alke, nombre de banco, Alke para ser detectado en la lista de usuarios creados.
        comprobar que al ingresar el número de cuenta Alke más el nombre de banco, Alke, despliega alerta con la información del contacto encontrado.
        comprobar que si el nombre de banco es alke, y la cuenta no existe, despliega alerta.

--- COMPLETADO ---

        buscar los contactos recien añadidos y confirmar todos sus datos.
        comprobar que funciona el hover en la lista, también que con las teclas arriba/abajo simula el hover.
        comprobar que la tecla Enter funciona como hacer click en el contacto y que Escape funciona como el botón Cancelar (Comprobar click y tecla).
        verificar que los botones "Enviar" y "Borrar Contacto" son visibles solo si hay un contacto seleccionado.
        tratar de enviar 500 a algún contacto, luego 1000, 1200, no deberia poder, verificar alertas.
        Verificar como se ve en diferentes tamaños de pantalla, tambien para la lista de contactos desplegada y el formulario.
        enviar 1500 al usuario común, luego 2500 al usuario Alke, verificar alerta y que vuelve al Menú.
        verificar que el saldo es de 20.000 [25.000 - (1500-500) - (2500-500)]
        Volver a entrar a la página Send y probar el logout.

--- COMPLETADO ---

    - Historial: entrar con (correo@prueba.com / prueba1234)
        verificar que el saldo es de 2.500, agregar de contacto al otro usuario Alke, tratar de enviar 2.200, no deberia, enviar 2.000.
        entrar al historial y verificar que indica la entrada de 2.500 desde Diego y que le enviaste 2.000, pero se restaron 500 de tax.
        Los botones anterior y siguiente no deberian funcionar, ya que hay muy pocos items en el historial.
        verificar que el saldo ahora es de 0.000 y el grafico lo indica bien.
        volver al historial y borrarlo, volver a ver el gráfico.
    - Send: buscar a Diego de contacto seleccionarlo y borrarlo, verificar alerta de confirmación, cancelar, volver el contacto.
        cancelar debería cerrar la lista de contactos.
        verificar que Diego sigue ahi, ahora si eliminarlo y verificar que ya no está.

--- COMPLETADO ---

    - Historial: volver a verificar el historial, probar el Logout desde ahi.
        Ahora ingresar con (correo@contacto.com / alke1234).
        verificar que el historial es:
            - entran 25.000 como depósito.
            - salen 2.000 (1.500 hacia Juan y 500 de tax)
            - salen 3.000 (2.500 hacia Pedro y 500 de tax)
    - Send: enviar 2.000 a Pedro, 3.000 a Juan, 3.500 a Pedro.
    - Deposit: verificar que el saldo es de 10.000
        depositar 4.000
        depositar 6.000
        depositar 5.000
    -Send: enviar 2.000 a Pedro, 3.000 a Juan, 3.500 a Pedro.
    - Deposit: saldo de 15.000
        depositar 2.000
        depositar 3.000
        depositar 30.000
    - Send: enviar 9.500 a Juan, 19.500 a Juan, 10.000 a Pedro y 9.000 a Juan.
    - Deposit: Verificar que el saldo es de 0
    - Historial: Veificar el historial y comprobar que funciona el sistema de páginas
        muestra 5 movimientos por página, que estén los 19 movimientos
        4 páginas, la última solo tiene 4.
    
    Ahora entrar con Pedro y verificar que tiene 20.000, revisar también su historial.

    Verificar que al entrar a cualquier página que no sea index, sin haber iniciado sesión, se redirija.
    Desde Index, según como se inició sesión (checkbox: recordarme),
    será redirigido hacia iniciar sesión, o hacia el menú con la cuenta ya conectada.