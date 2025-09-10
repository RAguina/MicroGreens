import Image from "next/image"
import { Button } from "@/components/ui/button"

const products = [
  { name: "Brócoli", description: "Rico en sulforafano y vitamina C" },
  { name: "Rábano", description: "Picante y lleno de antioxidantes" },
  { name: "Girasol", description: "Cremoso y rico en vitamina E" },
  { name: "Guisante", description: "Dulce y alto en proteínas" },
  { name: "Rúcula", description: "Picante y rica en vitamina K" },
  { name: "Amaranto", description: "Rico en lisina y calcio" },
]

export default function ProductosPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Nuestros Productos</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.name} className="border rounded-lg p-4">
            <Image
              src="/placeholder.svg?height=200&width=200"
              alt={product.name}
              width={200}
              height={200}
              className="mx-auto mb-4"
            />
            <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
            <p className="text-gray-600 mb-4">{product.description}</p>
            <Button className="w-full">Añadir al Carrito</Button>
          </div>
        ))}
      </div>
    </div>
  )
}

