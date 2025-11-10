export function getWriteOptions(opts={}){
  const options = typeof opts === 'object' ? {...opts}: {}
  const defaultName = 'Shapefile'
  let name = ''
  if (typeof opts === 'string'){
    name = opts
  } else {
    name = options?.name ?? defaultName
  }
  
  const basename = (name ?? defaultName).split('.')[0]
  
  const defaults = {
    name: basename + '.zip',
    types: {
      point: basename,
      line: basename,
      polygon: basename,
    } 
  }

  options.types = {
    ...defaults.types,
    ...options?.types ?? {}
  }

  return {
    ...defaults,
    ...options
  }
}