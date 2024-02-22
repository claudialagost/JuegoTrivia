let preguntas = [];
let misRespuestas = Array.from({ length: 10 });

document.addEventListener("DOMContentLoaded", function () {
    let token = sessionStorage.getItem('token');
    if (!token) {
        generarToken();
    }
});

function desordenar() {
    return Math.random() - 0.5;
}

const generarToken = () => {
    fetch('https://opentdb.com/api_token.php?command=request')
        .then(respuesta => respuesta.json())
        .then(datos => {
            if (datos.token) {
                sessionStorage.setItem('token', datos.token);
            }
        })
        .catch(error => {
            console.error('Hubo un error generado en el token: ', error);
        });
}

const obtenerPreguntas = () => {
    let token = sessionStorage.getItem('token');
    if (token) {
        const categoria = document.getElementById('select1').value;
        const dificultad = document.getElementById('select2').value;
        const tipo = document.getElementById('select3').value;

        if (categoria === "" || dificultad === "" || tipo === "") {
            alert('Debes seleccionar las opciones');
            return;
        } else {
            let url = `https://opentdb.com/api.php?amount=10&category=${categoria}&difficulty=${dificultad}&type=${tipo}`;
            fetch(url)
                .then(respuesta => respuesta.json())
                .then(datos => {
                    if (datos.results.length > 0) {
                        preguntas = datos.results.map(preguntaAPI => {
                            return {
                                pregunta: preguntaAPI.question,
                                respuestaCorrecta: preguntaAPI.correct_answer,
                                respuestasIncorrectas: preguntaAPI.incorrect_answers
                            };
                        });

                        preguntas.forEach((pregunta, index) => {
                            const preguntaHTML = document.createElement('div');
                            preguntaHTML.innerHTML = `
                                <h3>${pregunta.pregunta}</h3>
                                <ul>
                                    <li onclick="checkPreguntas('${pregunta.respuestaCorrecta}', ${index})" class="respuesta">${pregunta.respuestaCorrecta}</li>
                                    ${pregunta.respuestasIncorrectas.map(respuesta => `<li onclick="checkPreguntas('${respuesta}', ${index})" class="respuesta">${respuesta}</li>`).join('')}
                                </ul>
                            `;
                            document.getElementById('preguntas').appendChild(preguntaHTML);
                        });

                        document.getElementById('questionario').hidden = false;
                    } else {
                        document.getElementById('questionario').hidden = true;
                        alert('No hay una trivia disponible con las características seleccionadas, por favor cambia los valores e inténtalo de nuevo');
                    }
                })
                .catch(error => {
                    console.error('Hubo un error al obtener las preguntas: ', error);
                });
        }
    } else {
        generarToken();
    }
}

const checkPreguntas = (respuesta, indice) => {
    misRespuestas[indice] = respuesta;
    actualizarEstilos(indice);
};

const reset = () => {
    document.getElementById('questionario').hidden = true;
    document.getElementById('form').hidden = false;
};

const prueba = () => {
    console.log(misRespuestas);
}

function checkLleno() {
    return misRespuestas.every(elemento => elemento !== undefined && elemento !== null);
};

const calificar = () => {
    let puntaje = 0;
    if (checkLleno()) {
        misRespuestas.forEach((respuesta, indice) => {
            console.log('Respuesta: ', respuesta);
            console.log('Correcta: ', preguntas[indice].respuestaCorrecta);
            if (respuesta === preguntas[indice].respuestaCorrecta) {
                puntaje += 100;
            } else {
                aplicarEstilosRespuestaCorrecta(indice);
            }
            console.log('Puntaje: ', puntaje);
        });
        alert(`Tu puntaje es de ${puntaje} puntos`);
    } else {
        alert('Debes llenar todas las respuestas');
    }
};

function actualizarEstilos(indice) {
    const lista = document.getElementById('preguntas').children[indice].querySelector('ul');
    const respuestasHTML = lista.children;

    for (let i = 0; i < respuestasHTML.length; i++) {
        respuestasHTML[i].classList.remove('seleccionada');
    }

    const respuestaSeleccionada = misRespuestas[indice];
    const elementoSeleccionado = Array.from(lista.children).find(elemento => elemento.innerText === respuestaSeleccionada);

    if (elementoSeleccionado) {
        elementoSeleccionado.classList.add('seleccionada');
    }
}

function aplicarEstilosRespuestaCorrecta(indice) {
    const lista = document.getElementById('preguntas').children[indice].querySelector('ul');
    const respuestasHTML = Array.from(lista.children);

    // Encontrar la respuesta correcta y aplicar estilos
    const respuestaCorrecta = preguntas[indice].respuestaCorrecta;
    const elementoCorrecto = respuestasHTML.find(elemento => elemento.innerText === respuestaCorrecta);

    if (elementoCorrecto) {
        elementoCorrecto.classList.add('respuesta-correcta');
    }
}
