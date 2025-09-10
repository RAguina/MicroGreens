"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    mensaje: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para enviar el formulario
    console.log("Formulario enviado:", formData)
    alert("Gracias por tu mensaje. Nos pondremos en contacto contigo pronto.")
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Contáctanos</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nombre" className="block mb-1">
            Nombre
          </label>
          <Input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="email" className="block mb-1">
            Email
          </label>
          <Input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="mensaje" className="block mb-1">
            Mensaje
          </label>
          <Textarea id="mensaje" name="mensaje" value={formData.mensaje} onChange={handleChange} required rows={4} />
        </div>
        <Button type="submit">Enviar Mensaje</Button>
      </form>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Información de Contacto</h2>
        <p>Email: info@microverde.com</p>
        <p>Teléfono: (123) 456-7890</p>
        <p>Dirección: Calle Principal 123, Ciudad, País</p>
      </div>
    </div>
  )
}

