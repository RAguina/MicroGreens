import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Header() {
  return (
    <header className="bg-green-600 text-white">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          MicroVerde
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="/" className="hover:underline">
                Inicio
              </Link>
            </li>
            <li>
              <Link href="/productos" className="hover:underline">
                Productos
              </Link>
            </li>
            <li>
              <Link href="/sobre-nosotros" className="hover:underline">
                Sobre Nosotros
              </Link>
            </li>
            <li>
              <Link href="/contacto" className="hover:underline">
                Contacto
              </Link>
            </li>
          </ul>
        </nav>
        <Button variant="outline" className="text-white border-white hover:bg-white hover:text-green-600">
          Hacer Pedido
        </Button>
      </div>
    </header>
  )
}

