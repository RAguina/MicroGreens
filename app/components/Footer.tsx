import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-green-800 text-white">
      <div className="container mx-auto px-4 py-8 flex flex-wrap justify-between">
        <div className="w-full md:w-1/3 mb-6 md:mb-0">
          <h3 className="text-xl font-bold mb-2">MicroVerde</h3>
          <p>Cultivando salud y sabor en cada brote.</p>
        </div>
        <div className="w-full md:w-1/3 mb-6 md:mb-0">
          <h4 className="text-lg font-semibold mb-2">Enlaces Rápidos</h4>
          <ul>
            <li>
              <Link href="/productos" className="hover:underline">
                Nuestros Productos
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
        </div>
        <div className="w-full md:w-1/3">
          <h4 className="text-lg font-semibold mb-2">Contáctanos</h4>
          <p>Email: info@microverde.com</p>
          <p>Teléfono: (123) 456-7890</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-4 text-center border-t border-green-700">
        <p>&copy; 2024 MicroVerde. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}

