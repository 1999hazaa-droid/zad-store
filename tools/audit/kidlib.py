async def wiz(pg,name,sex='b',age=None,grade=None,girl=None):
    await pg.wait_for_selector('#zkn')
    await pg.fill('#zkn',name or '')
    await pg.click(f'.zks.{sex}')
    if grade: await pg.click('#zqm [data-m="g"]'); await pg.click(f'#zkg .zkb[data-g="{grade}"]')
    elif age: await pg.click('#zqm [data-m="a"]'); await pg.click(f'#zka .zkb[data-a="{age}"]')
    await pg.click('#zkgo')

