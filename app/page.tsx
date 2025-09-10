import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl font-bold mb-4">Bienvenidos a MicroVerde</h1>
        <p className="text-xl mb-6">Descubre el poder nutritivo de los microgreens</p>
        <Button asChild>
          <Link href="/productos">Ver Nuestros Productos</Link>
        </Button>
      </section>

      <section className="grid md:grid-cols-3 gap-8">
        <div className="text-center">
          <Image
            src="/placeholder.svg?height=200&width=200"
            alt="Frescura"
            width={200}
            height={200}
            className="mx-auto mb-4"
          />
          <h3 className="text-xl font-semibold mb-2">Frescura Garantizada</h3>
          <p>Nuestros microgreens son cosechados diariamente para asegurar la máxima frescura.</p>
        </div>
        <div className="text-center">
          <Image
            src="/placeholder.svg?height=200&width=200"
            alt="Nutrición"
            width={200}
            height={200}
            className="mx-auto mb-4"
          />
          <h3 className="text-xl font-semibold mb-2">Alta Nutrición</h3>
          <p>Ricos en vitaminas, minerales y antioxidantes para una dieta saludable.</p>
        </div>
        <div className="text-center">
          <Image
            src="/placeholder.svg?height=200&width=200"
            alt="Sostenibilidad"
            width={200}
            height={200}
            className="mx-auto mb-4"
          />
          <h3 className="text-xl font-semibold mb-2">Cultivo Sostenible</h3>
          <p>Utilizamos métodos de cultivo ecológicos y sostenibles.</p>
        </div>
      </section>

      <section className="bg-green-100 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Nuestros Productos Destacados</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {["Brócoli", "Rábano", "Girasol", "Guisante"].map((product) => (
            <div key={product} className="bg-white p-4 rounded shadow">
              <Image
                src="/placeholder.svg?height=150&width=150"
                alt={product}
                width={150}
                height={150}
                className="mx-auto mb-2"
              />
              <h4 className="text-lg font-semibold mb-1">{product}</h4>
              <p className="text-sm text-gray-600">Microgreens de {product.toLowerCase()}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

