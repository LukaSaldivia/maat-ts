export default function(query : string){
  if (typeof query !== 'string') return '';

  // Eliminar comentarios SQL
  query = query.replace(/(--|#|\/\*[\s\S]*?\*\/)/g, '');

  // Escapar comillas simples y dobles
  query = query.replace(/['"]/g, match => `\\${match}`);

  // Opcional: prevenir algunas palabras peligrosas (case insensitive)
  const blacklist = ['DROP', 'DELETE', 'TRUNCATE', 'INSERT', 'UPDATE'];
  const regex = new RegExp(`\\b(${blacklist.join('|')})\\b`, 'gi');
  query = query.replace(regex, '');

  // Eliminar espacios repetidos
  query = query.replace(/\s{2,}/g, ' ').trim();

  return query;
}