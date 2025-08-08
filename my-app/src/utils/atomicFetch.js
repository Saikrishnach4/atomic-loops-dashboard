
export const atomicFetch = async (
  url,
  init = {
    method: "GET",
    headers: {},
    body: {},
    withAuth: false,
    signal: null,
  }
) => {
  const headers = new Headers({
    "Content-Type": "application/json",
    "X-timezone-region": Intl.DateTimeFormat().resolvedOptions().timeZone,
    "Accept-Language": "en",
    ...(init.headers || {}),
  });


  if (init?.withAuth ?? false) {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      headers.append("Authorization", `Bearer ${accessToken}`);
    }
  }


  let requestObj = {
    method: init.method,
    signal: init.signal,
    headers,
  };

  if (["POST", "PUT", "PATCH"].includes(init.method)) {
    requestObj.body = JSON.stringify(init.body);
  }

  try {
    const response = await fetch(url, requestObj);


    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`Expected JSON response but got ${contentType}`);
    }

    const json = await response.json();


    if (Array.isArray(json) || typeof json === 'object') {
      return {
        data: json,
        error: null,
        success: response.ok,
        status: response.status,
        statusText: response.statusText
      };
    }

    // For other APIs that follow the standard format
    return {
      data: json.data,
      error: json.error,
      success: json.isSuccess || response.ok,
      status: response.status,
      statusText: response.statusText
    };
  } catch (error) {
    return {
      data: null,
      error: error.message,
      success: false,
      status: 0,
      statusText: error.message
    };
  }
};
