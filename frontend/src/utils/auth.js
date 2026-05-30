const TOKEN_KEY = 'rag_token_v1'

export function setToken(token){
  if(!token) return
  localStorage.setItem(TOKEN_KEY, token)
}

export function getToken(){
  return localStorage.getItem(TOKEN_KEY)
}

export function clearToken(){
  localStorage.removeItem(TOKEN_KEY)
}

export function parseJwt(token){
  if(!token) return null
  try{
    const parts = token.split('.')
    if(parts.length<2) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/')))
    return payload
  }catch(e){
    return null
  }
}
