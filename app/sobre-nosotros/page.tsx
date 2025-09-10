import Image from "next/image"

export default function SobreNosotrosPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold mb-6">Sobre MicroVerde</h1>

      <section className="flex flex-col md:flex-row items-center gap-8">
        <div className="md:w-1/2">
          <Image
            src="/placeholder.svg?height=400&width=600"
            alt="Nuestro Invernadero"
            width={600}
            height={400}
            className="rounded-lg"
          />
        </div>
        <div className="md:w-1/2">
          <h2 className="text-2xl font-semibold mb-4">Nuestra Historia</h2>
          <p className="mb-4">
            MicroVerde nació en 2015 con la visión de llevar alimentos nutritivos y sostenibles a las mesas de nuestros
            clientes. Comenzamos como una pequeña operación familiar y hemos crecido hasta convertirnos en líderes en el
            cultivo de microgreens en nuestra región.
          </p>
          <p>
            Nuestro compromiso con la calidad, la frescura y la sostenibilidad nos ha permitido crecer y expandirnos,
            manteniendo siempre nuestros valores fundamentales de proporcionar alimentos saludables y respetar el medio
            ambiente.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Nuestro Proceso</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border rounded-lg p-4 text-center">
            <Image
              src="/placeholder.svg?height=150&width=150"
              alt="Siembra"
              width={150}
              height={150}
              className="mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">Siembra Cuidadosa</h3>
            <p>
              Seleccionamos las mejores semillas y las sembramos con precisión para garantizar un crecimiento óptimo.
            </p>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <Image
              src="/placeholder.svg?height=150&width=150"
              alt="Cultivo"
              width={150}
              height={150}
              className="mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">Cultivo Controlado</h3>
            <p>
              Nuestros microgreens crecen en un ambiente controlado, asegurando las condiciones ideales en todo momento.
            </p>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <Image
              src="/placeholder.svg?height=150&width=150"
              alt="Cosecha"
              width={150}
              height={150}
              className="mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">Cosecha Fresca</h3>
            <p>
              Cosechamos nuestros microgreens justo antes de la entrega para garantizar la máxima frescura y nutrición.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Nuestro Equipo</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {["María", "Juan", "Ana", "Carlos"].map((name) => (
            <div key={name} className="text-center">
              <Image
                src="/placeholder.svg?height=150&width=150"
                alt={name}
                width={150}
                height={150}
                className="mx-auto rounded-full mb-2"
              />
              <h3 className="font-semibold">{name}</h3>
              <p className="text-sm text-gray-600">Especialista en Microgreens</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

