
export default function Input({className, ...props}: any) {

    return (
       <input className={`border border-gray-900 rounded-sm md:w-lg px-4 py-2 text-lg ${className}`} {...props} />
    )
}