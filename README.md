#ISTAC Medio Ambiente

###Descripción
ISTAC Medio Ambiente es una aplicación que permite visualizar datos recogidos por el [ISTAC (Instituto Canario de Estadística)][ISTAC], relacionados con el área de medio ambiente.

Los datos podrán ser visualizados según los criterios de elección del usuario, pudiendo elegir gracias a diversos filtros qué información desea ver, sobre qué islas y en qué periodo de tiempo.
La forma de representación de los mismos será tanto numérica como gráfica.

###Tecnologías utilizadas
* [Ionic Framework][Ionic Framework]
* [D3.js][D3.js]

###Forma de uso
__NOTA:__ Primeramente, debe tener instalado Ionic Framework para poder ejecutar la aplicación tanto en su ordenador como para depurarla en su dispositivo móvil.
Puede descargarlo haciendo click [aquí][Ionic DL]. Tenga en cuenta que debe configurar Ionic para que pueda hacer uso del SDK de la plataforma que elija para ejecutar la aplicación en un sistema operativo móvil, como Android o iOS.

Puede descargar el proyecto como fichero ZIP haceindo click [aquí][zip] o clonando el repositorio mediante `git`:

```
$ git clone https://github.com/eliasib13/ISTAC-medio-ambiente.git
```

Luego, sitúese en el directorio raíz del proyecto. Desde allí:
* Puede emular el comportamiento de la aplicación en su navvegador, actualizando los cambios que se hagan en el código en directo.
  Para ello, ejecute en su ordenador el comando:

  ```
  $ ionic serve
  ```

  Este comando abrirá un servidor donde ejecutará la aplicación y una pestaña de navegador donde podrá hacer uso de la aplicación.

* Si desea ejecutar la aplicación en un emulador o dispositivo móvil, ejecute:
  * Para Android:
  ```
  $ ionic run android
  ```

  * Para iOS:
  ```
  $ ionic run ios
  ```

Para más información, consulte la ayuda de Ionic (`$ ionic help`)



[ISTAC]: http://www.gobiernodecanarias.org/istac/
[Ionic Framework]: http://ionicframework.com/
[D3.js]: http://d3js.org/
[Ionic DL]: http://ionicframework.com/getting-started/
[zip]: https://github.com/eliasib13/ISTAC-medio-ambiente/archive/master.zip
